import { useRegionQuery } from '@linode/queries';
import {
  Accordion,
  Stack,
  TextField,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { VLANSelect } from 'src/components/VLANSelect';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import { VLANAvailabilityNotice } from '../Networking/VLANAvailabilityNotice';
import { useGetLinodeCreateType } from '../Tabs/utils/useGetLinodeCreateType';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const VLAN = () => {
  const { control } = useFormContext<CreateLinodeRequest>();

  const createType = useGetLinodeCreateType();

  const { permissions } = usePermissions('account', ['create_linode']);

  const [imageId, regionId] = useWatch({ control, name: ['image', 'region'] });

  const { data: selectedRegion } = useRegionQuery(regionId);

  const regionSupportsVLANs =
    selectedRegion?.capabilities.includes('Vlans') ?? false;

  const isCreatingFromBackup = createType === 'Backups';

  const disabled =
    !imageId ||
    isCreatingFromBackup ||
    !permissions.create_linode ||
    !regionSupportsVLANs;

  return (
    <Accordion
      heading={
        <Stack direction="row" spacing={1}>
          <Typography variant="h2">VLAN</Typography>
          {isCreatingFromBackup && (
            <TooltipIcon
              status="info"
              sxTooltipIcon={{ p: 0 }}
              text="You cannot attach a VLAN when deploying to a new Linode from a backup."
            />
          )}
          {!imageId && !isCreatingFromBackup && (
            <TooltipIcon
              status="info"
              sxTooltipIcon={{ p: 0 }}
              text="You must select an Image to attach a VLAN."
            />
          )}
        </Stack>
      }
      sx={{ margin: '0 !important', padding: 1 }}
    >
      {selectedRegion && !regionSupportsVLANs && <VLANAvailabilityNotice />}
      <Typography variant="body1">
        VLANs are used to create a private L2 Virtual Local Area Network between
        Linodes. A VLAN created or attached in this section will be assigned to
        the eth1 interface, with eth0 being used for connections to the public
        internet. VLAN configurations can be further edited in the
        Linode&rsquo;s{' '}
        <Link to="https://techdocs.akamai.com/cloud-computing/docs/manage-configuration-profiles-on-a-compute-instance">
          Configuration Profile
        </Link>
        .
      </Typography>
      <Stack
        alignItems="flex-start"
        direction="row"
        flexWrap="wrap"
        gap={2}
        mt={2}
      >
        <Controller
          control={control}
          name="interfaces.1.label"
          render={({ field, fieldState }) => (
            <VLANSelect
              disabled={disabled}
              errorText={fieldState.error?.message}
              filter={{ region: regionId }}
              helperText={
                !regionId
                  ? 'Select a region to see available VLANs.'
                  : undefined
              }
              onBlur={field.onBlur}
              onChange={field.onChange}
              sx={{ width: 300 }}
              value={field.value ?? null}
            />
          )}
        />
        <Controller
          control={control}
          name="interfaces.1.ipam_address"
          render={({ field, fieldState }) => (
            <TextField
              containerProps={{ maxWidth: 335 }}
              disabled={disabled}
              errorText={fieldState.error?.message}
              label="IPAM Address"
              noMarginTop
              onBlur={field.onBlur}
              onChange={field.onChange}
              optional
              placeholder="192.0.2.0/24"
              tooltipText={
                'IPAM address must use IP/netmask format, e.g. 192.0.2.0/24.'
              }
              value={field.value ?? ''}
            />
          )}
        />
      </Stack>
    </Accordion>
  );
};
