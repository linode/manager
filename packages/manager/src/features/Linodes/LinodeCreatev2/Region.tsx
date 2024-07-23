import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useController, useFormContext, useWatch } from 'react-hook-form';

import { Box } from 'src/components/Box';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/DiskEncryption/utils';
import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { isDistributedRegionSupported } from 'src/components/RegionSelect/RegionSelect.utils';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useImageQuery } from 'src/queries/images';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { useTypeQuery } from 'src/queries/types';
import {
  DIFFERENT_PRICE_STRUCTURE_WARNING,
  DOCS_LINK_LABEL_DC_PRICING,
} from 'src/utilities/pricing/constants';
import { isLinodeTypeDifferentPriceInSelectedRegion } from 'src/utilities/pricing/linodes';

import { CROSS_DATA_CENTER_CLONE_WARNING } from '../LinodesCreate/constants';
import { getDisabledRegions } from './Region.utils';
import {
  getGeneratedLinodeLabel,
  useLinodeCreateQueryParams,
} from './utilities';

import type { LinodeCreateFormValues } from './utilities';
import type { Region as RegionType } from '@linode/api-v4';

export const Region = () => {
  const {
    isDiskEncryptionFeatureEnabled,
  } = useIsDiskEncryptionFeatureEnabled();

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
    Boolean(selectedLinode)
  );

  const isLinodeCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const { data: regions } = useRegionsQuery();

  const onChange = async (region: RegionType) => {
    const values = getValues();

    field.onChange(region.id);

    if (values.interfaces?.[0].vpc_id) {
      // If a VPC is selected, clear it.
      setValue('interfaces.0.vpc_id', null);
      setValue('interfaces.0.subnet_id', null);
    }

    if (values.interfaces?.[1].label) {
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

    if (
      values.placement_group?.id &&
      !region.capabilities.includes('Placement Group')
    ) {
      // @ts-expect-error reset might be good here
      setValue('placement_group.id', null);
    }

    if (region.site_type === 'distributed') {
      setValue('backups_enabled', false);
      setValue('private_ip', false);
    }

    if (isDiskEncryptionFeatureEnabled) {
      // Enable disk encryption if the region supports it
      const defaultDiskEncryptionValue = region.capabilities.includes(
        'Disk Encryption'
      )
        ? 'enabled'
        : undefined;

      setValue('disk_encryption', defaultDiskEncryptionValue);
    }

    if (!isLabelFieldDirty) {
      const label = await getGeneratedLinodeLabel({
        queryClient,
        tab: params.type ?? 'OS',
        values: getValues(),
      });
      setValue('label', label);
    }
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
    flags.gecko2?.ga ||
    !isDistributedRegionSupported(params.type ?? 'OS');

  const showDistributedRegionIconHelperText =
    !hideDistributedRegions &&
    regions?.some(
      (region) =>
        region.site_type === 'distributed' || region.site_type === 'edge'
    );

  const disabledRegions = getDisabledRegions({
    linodeCreateTab: params.type,
    regions: regions ?? [],
    selectedImage: image,
  });

  return (
    <Paper>
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography variant="h2">Region</Typography>
        <DocsLink
          href="https://www.linode.com/pricing"
          label={DOCS_LINK_LABEL_DC_PRICING}
        />
      </Box>
      <RegionHelperText />
      {showCrossDataCenterCloneWarning && (
        <Notice spacingBottom={0} spacingTop={8} variant="warning">
          <Typography fontFamily={(theme) => theme.font.bold}>
            {CROSS_DATA_CENTER_CLONE_WARNING}
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
        showDistributedRegionIconHelperText={
          showDistributedRegionIconHelperText
        }
        currentCapability="Linodes"
        disableClearable
        disabled={isLinodeCreateRestricted}
        disabledRegions={disabledRegions}
        errorText={fieldState.error?.message}
        onChange={(e, region) => onChange(region)}
        regions={regions ?? []}
        textFieldProps={{ onBlur: field.onBlur }}
        value={field.value}
      />
      {showClonePriceWarning && (
        <Notice spacingBottom={0} spacingTop={12} variant="warning">
          <Typography fontFamily={(theme) => theme.font.bold}>
            {DIFFERENT_PRICE_STRUCTURE_WARNING}{' '}
            <Link to="https://www.linode.com/pricing">Learn more.</Link>
          </Typography>
        </Notice>
      )}
    </Paper>
  );
};
