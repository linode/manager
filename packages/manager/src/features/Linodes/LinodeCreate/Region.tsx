import { useRegionsQuery } from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import { Box, Notice, Paper, Typography } from '@linode/ui';
import { getIsLegacyInterfaceArray } from '@linode/utilities';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useController, useFormContext, useWatch } from 'react-hook-form';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import { Link } from 'src/components/Link';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { isDistributedRegionSupported } from 'src/components/RegionSelect/RegionSelect.utils';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useImageQuery } from 'src/queries/images';
import { useTypeQuery } from 'src/queries/types';
import {
  sendLinodeCreateFormInputEvent,
  sendLinodeCreateFormStartEvent,
} from 'src/utilities/analytics/formEventAnalytics';
import {
  DIFFERENT_PRICE_STRUCTURE_WARNING,
  DOCS_LINK_LABEL_DC_PRICING,
} from 'src/utilities/pricing/constants';
import { isLinodeTypeDifferentPriceInSelectedRegion } from 'src/utilities/pricing/linodes';

import { getDisabledRegions } from './Region.utils';
import { TwoStepRegion } from './TwoStepRegion';
import {
  getGeneratedLinodeLabel,
  useLinodeCreateQueryParams,
} from './utilities';

import type { LinodeCreateFormValues } from './utilities';
import type { Region as RegionType } from '@linode/api-v4';

export const Region = React.memo(() => {
  const { isDiskEncryptionFeatureEnabled } =
    useIsDiskEncryptionFeatureEnabled();

  const flags = useFlags();
  const queryClient = useQueryClient();

  const { params } = useLinodeCreateQueryParams();

  const {
    control,
    formState: {
      dirtyFields: { label: isLabelFieldDirty },
    },
    getValues,
    setValue,
  } = useFormContext<LinodeCreateFormValues>();

  const { field, fieldState } = useController({
    control,
    name: 'region',
  });

  const [selectedLinode, selectedImage] = useWatch({
    control,
    name: ['linode', 'image'],
  });

  const { data: image } = useImageQuery(
    selectedImage ?? '',
    Boolean(selectedImage)
  );

  const { data: type } = useTypeQuery(
    selectedLinode?.type ?? '',
    Boolean(selectedLinode?.type)
  );

  const isLinodeCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const { data: regions } = useRegionsQuery();

  const { isGeckoLAEnabled } = useIsGeckoEnabled(
    flags.gecko2?.enabled,
    flags.gecko2?.la
  );

  const showTwoStepRegion =
    isGeckoLAEnabled && isDistributedRegionSupported(params.type ?? 'OS');

  const onChange = async (region: RegionType) => {
    const values = getValues();

    field.onChange(region.id);

    if (values.hasSignedEUAgreement) {
      // Reset the EU agreement checkbox if they checked it so they have to re-agree when they change regions
      setValue('hasSignedEUAgreement', false);
    }

    // @TODO Linode Interfaces - need to handle case if interface is not legacy
    if (
      getIsLegacyInterfaceArray(values.interfaces) &&
      values.interfaces?.[0].vpc_id
    ) {
      // If a VPC is selected, clear it because VPCs are region specific
      setValue('interfaces.0.vpc_id', null);
      setValue('interfaces.0.subnet_id', null);
    }

    // @TODO Linode Interfaces - need to handle case if interface is not legacy
    if (
      getIsLegacyInterfaceArray(values.interfaces) &&
      values.interfaces?.[1].label
    ) {
      // If a VLAN is selected, clear it because VLANs are region specific
      setValue('interfaces.1.label', null);
      setValue('interfaces.1.ipam_address', null);
    }

    if (
      values.metadata?.user_data &&
      !region.capabilities.includes('Metadata')
    ) {
      // Clear metadata only if the new region does not support it
      setValue('metadata.user_data', null);
    }

    if (values.placement_group?.id) {
      // If a placement group is selected, clear it because they are region specific
      setValue('placement_group.id', 0);
    }

    // Because distributed regions do not support some features,
    // we must disable those features here. Keep in mind, we should
    // prevent the user from enabling these features in their respective components.
    if (region.site_type === 'distributed') {
      setValue('backups_enabled', false);
      setValue('private_ip', false);
    }

    if (isDiskEncryptionFeatureEnabled) {
      if (region.site_type === 'distributed') {
        // If a distributed region is selected, make sure we don't send disk_encryption in the payload.
        setValue('disk_encryption', undefined);
      } else {
        // Enable disk encryption by default if the region supports it
        const defaultDiskEncryptionValue =
          region.capabilities.includes('Disk Encryption') ||
          region.capabilities.includes('LA Disk Encryption')
            ? 'enabled'
            : undefined;

        setValue('disk_encryption', defaultDiskEncryptionValue);
      }
    }

    if (!isLabelFieldDirty) {
      // Auto-generate the Linode label because the region is included in the generated label
      const label = await getGeneratedLinodeLabel({
        queryClient,
        tab: params.type ?? 'OS',
        values: { ...values, region: region.id },
      });

      setValue('label', label);
    }

    // Begin tracking the Linode Create form.
    sendLinodeCreateFormStartEvent({
      createType: params.type ?? 'OS',
    });
  };

  const showCrossDataCenterCloneWarning =
    params.type === 'Clone Linode' &&
    selectedLinode &&
    selectedLinode.region !== field.value;

  const showClonePriceWarning =
    params.type === 'Clone Linode' &&
    isLinodeTypeDifferentPriceInSelectedRegion({
      regionA: selectedLinode?.region,
      regionB: field.value,
      type,
    });

  const hideDistributedRegions =
    !flags.gecko2?.enabled ||
    !isDistributedRegionSupported(params.type ?? 'OS');

  const disabledRegions = getDisabledRegions({
    regions: regions ?? [],
    selectedImage: image,
  });

  if (showTwoStepRegion) {
    return (
      <TwoStepRegion
        regionFilter={
          // We don't want the Image Service Gen2 work to abide by Gecko feature flags
          hideDistributedRegions && params.type !== 'Images'
            ? 'core'
            : undefined
        }
        disabled={isLinodeCreateRestricted}
        disabledRegions={disabledRegions}
        errorText={fieldState.error?.message}
        onChange={onChange}
        textFieldProps={{ onBlur: field.onBlur }}
        value={field.value}
      />
    );
  }

  return (
    <Paper data-qa-linode-region>
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography variant="h2">Region</Typography>
        <DocsLink
          onClick={() =>
            sendLinodeCreateFormInputEvent({
              createType: params.type ?? 'OS',
              headerName: 'Region',
              interaction: 'click',
              label: DOCS_LINK_LABEL_DC_PRICING,
            })
          }
          href="https://www.linode.com/pricing"
          label={DOCS_LINK_LABEL_DC_PRICING}
        />
      </Box>
      <RegionHelperText />
      {showCrossDataCenterCloneWarning && (
        <Notice spacingBottom={0} spacingTop={8} variant="warning">
          <Typography sx={(theme) => ({ font: theme.font.bold })}>
            Cloning a powered off instance across data centers may cause long
            periods of down time.
          </Typography>
        </Notice>
      )}
      <RegionSelect
        regionFilter={
          // We don't want the Image Service Gen2 work to abide by Gecko feature flags
          hideDistributedRegions && params.type !== 'Images'
            ? 'core'
            : undefined
        }
        currentCapability="Linodes"
        disableClearable
        disabled={isLinodeCreateRestricted}
        disabledRegions={disabledRegions}
        errorText={fieldState.error?.message}
        isGeckoLAEnabled={isGeckoLAEnabled}
        onChange={(e, region) => onChange(region)}
        regions={regions ?? []}
        textFieldProps={{ onBlur: field.onBlur }}
        value={field.value}
      />
      {showClonePriceWarning && (
        <Notice spacingBottom={0} spacingTop={12} variant="warning">
          <Typography sx={(theme) => ({ font: theme.font.bold })}>
            {DIFFERENT_PRICE_STRUCTURE_WARNING}{' '}
            <Link to="https://www.linode.com/pricing">Learn more.</Link>
          </Typography>
        </Notice>
      )}
    </Paper>
  );
});
