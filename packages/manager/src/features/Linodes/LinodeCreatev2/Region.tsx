import React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { Box } from 'src/components/Box';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/DiskEncryption/utils';
import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { Paper } from 'src/components/Paper';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import { Typography } from 'src/components/Typography';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { DOCS_LINK_LABEL_DC_PRICING } from 'src/utilities/pricing/constants';

import { defaultInterfaces } from './utilities';

import type { LinodeCreateFormValues } from './utilities';
import type { Region as RegionType } from '@linode/api-v4';

export const Region = () => {
  const {
    isDiskEncryptionFeatureEnabled,
  } = useIsDiskEncryptionFeatureEnabled();

  const { control, setValue } = useFormContext<LinodeCreateFormValues>();
  const { field, fieldState } = useController({
    control,
    name: 'region',
  });

  const isLinodeCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const { data: regions } = useRegionsQuery();

  const onChange = (region: RegionType) => {
    field.onChange(region.id);

    // Reset interfaces because VPC and VLANs are region-sepecific
    setValue('interfaces', defaultInterfaces);

    // Reset the placement group because they are region-specific
    setValue('placement_group', undefined);

    // Enable disk encryption if the selected region supports it
    if (isDiskEncryptionFeatureEnabled) {
      const diskEncryptionStatus = region.capabilities.includes(
        'Disk Encryption'
      )
        ? 'enabled'
        : 'disabled';

      setValue('disk_encryption', diskEncryptionStatus);
    }
  };

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
      <RegionSelect
        currentCapability="Linodes"
        disableClearable
        disabled={isLinodeCreateRestricted}
        errorText={fieldState.error?.message}
        onChange={(e, region) => onChange(region)}
        regions={regions ?? []}
        value={field.value}
      />
    </Paper>
  );
};
