import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Accordion } from 'src/components/Accordion';
import { Link } from 'src/components/Link';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { VLANSelect } from 'src/components/VLANSelect';

import { VLANAvailabilityNotice } from '../LinodesCreate/VLANAvailabilityNotice';
import { useLinodeCreateQueryParams } from './utilities';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const VLAN = () => {
  const { control } = useFormContext<CreateLinodeRequest>();

  const { params } = useLinodeCreateQueryParams();

  const isCreatingFromBackup = params.type === 'Backups';

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
        <Link to="https://www.linode.com/docs/guides/linode-configuration-profiles/">
          Configuration Profile
        </Link>
        .
      </Typography>
      <Stack columnGap={2} direction="row" flexWrap="wrap">
        <Controller
          render={({ field, fieldState }) => (
            <VLANSelect
              errorText={fieldState.error?.message}
              onChange={field.onChange}
              sx={{ minWidth: 300 }}
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
              errorText={fieldState.error?.message}
              label="IPAM Address"
              onChange={field.onChange}
              optional
              placeholder="192.0.2.0/24"
              sx={{ maxWidth: 300 }}
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
