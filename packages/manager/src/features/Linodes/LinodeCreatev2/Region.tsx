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
import { useRegionsQuery } from 'src/queries/regions/regions';
import { useTypeQuery } from 'src/queries/types';
import {
  DIFFERENT_PRICE_STRUCTURE_WARNING,
  DOCS_LINK_LABEL_DC_PRICING,
} from 'src/utilities/pricing/constants';
import { isLinodeTypeDifferentPriceInSelectedRegion } from 'src/utilities/pricing/linodes';

import { CROSS_DATA_CENTER_CLONE_WARNING } from '../LinodesCreate/constants';
import { defaultInterfaces, useLinodeCreateQueryParams } from './utilities';

import type { LinodeCreateFormValues } from './utilities';
import type { Region as RegionType } from '@linode/api-v4';

export const Region = () => {
  const {
    isDiskEncryptionFeatureEnabled,
  } = useIsDiskEncryptionFeatureEnabled();

  const flags = useFlags();

  const { params } = useLinodeCreateQueryParams();

  const { control, reset } = useFormContext<LinodeCreateFormValues>();
  const { field, fieldState } = useController({
    control,
    name: 'region',
  });

  const selectedLinode = useWatch({ control, name: 'linode' });

  const { data: type } = useTypeQuery(
    selectedLinode?.type ?? '',
    Boolean(selectedLinode)
  );

  const isLinodeCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const { data: regions } = useRegionsQuery();

  const onChange = (region: RegionType) => {
    const isDistributedRegion =
      region.site_type === 'distributed' || region.site_type === 'edge';

    const defaultDiskEncryptionValue = region.capabilities.includes(
      'Disk Encryption'
    )
      ? 'enabled'
      : undefined;

    reset((prev) => ({
      ...prev,
      // Reset interfaces because VPC and VLANs are region-sepecific
      interfaces: defaultInterfaces,
      // Reset Cloud-init metadata because not all regions support it
      metadata: undefined,
      // Reset the placement group because they are region-specific
      placement_group: undefined,
      // Set the region
      region: region.id,
      // Backups and Private IP are not supported in distributed compute regions
      ...(isDistributedRegion && {
        backups_enabled: false,
        private_ip: false,
      }),
      // If disk encryption is enabled, set the default value to "enabled" if the region supports it
      ...(isDiskEncryptionFeatureEnabled && {
        disk_encryption: defaultDiskEncryptionValue,
      }),
    }));
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
    !isDistributedRegionSupported(params.type ?? 'Distributions');

  const showDistributedRegionIconHelperText =
    !hideDistributedRegions &&
    regions?.some(
      (region) =>
        region.site_type === 'distributed' || region.site_type === 'edge'
    );

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
        showDistributedRegionIconHelperText={
          showDistributedRegionIconHelperText
        }
        currentCapability="Linodes"
        disableClearable
        disabled={isLinodeCreateRestricted}
        errorText={fieldState.error?.message}
        onChange={(e, region) => onChange(region)}
        regionFilter={hideDistributedRegions ? 'core' : undefined}
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
