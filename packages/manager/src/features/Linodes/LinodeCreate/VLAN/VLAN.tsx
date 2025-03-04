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
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { doesRegionSupportFeature } from 'src/utilities/doesRegionSupportFeature';

import { useLinodeCreateQueryParams } from '../utilities';
import { VLANAvailabilityNotice } from './VLANAvailabilityNotice';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const VLAN = () => {
  const { control } = useFormContext<CreateLinodeRequest>();

  const { data: regions } = useRegionsQuery();

  const { params } = useLinodeCreateQueryParams();

  const isLinodeCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const [imageId, regionId] = useWatch({ control, name: ['image', 'region'] });

  const regionSupportsVLANs = doesRegionSupportFeature(
    regionId,
    regions ?? [],
    'Vlans'
  );

  const isCreatingFromBackup = params.type === 'Backups';

  const disabled =
    !imageId ||
    isCreatingFromBackup ||
    isLinodeCreateRestricted ||
    !regionSupportsVLANs;

  return (
    <Accordion
      heading={
        <Stack direction="row" spacing={1}>
          <Typography variant="h2">VLAN</Typography>
          {isCreatingFromBackup && (
            <TooltipIcon
              status="help"
              sxTooltipIcon={{ p: 0 }}
              text="You cannot attach a VLAN when deploying to a new Linode from a backup."
            />
          )}
          {!imageId && !isCreatingFromBackup && (
            <TooltipIcon
              status="help"
              sxTooltipIcon={{ p: 0 }}
              text="You must select an Image to attach a VLAN."
            />
          )}
        </Stack>
      }
      sx={{ margin: '0 !important', padding: 1 }}
    >
      <VLANAvailabilityNotice />
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
      <Stack columnGap={2} direction="row" flexWrap="wrap" mt={2}>
        <Controller
          render={({ field, fieldState }) => (
            <VLANSelect
              disabled={disabled}
              errorText={fieldState.error?.message}
              filter={{ region: regionId }}
              onBlur={field.onBlur}
              onChange={field.onChange}
              sx={{ width: 300 }}
              value={field.value ?? null}
            />
          )}
          control={control}
          name="interfaces.1.label"
        />
        <Controller
          render={({ field, fieldState }) => (
            <TextField
              tooltipText={
                'IPAM address must use IP/netmask format, e.g. 192.0.2.0/24.'
              }
              containerProps={{ maxWidth: 335 }}
              disabled={disabled}
              errorText={fieldState.error?.message}
              label="IPAM Address"
              noMarginTop
              onBlur={field.onBlur}
              onChange={field.onChange}
              optional
              placeholder="192.0.2.0/24"
              value={field.value ?? ''}
            />
          )}
          control={control}
          name="interfaces.1.ipam_address"
        />
      </Stack>
    </Accordion>
  );
};
