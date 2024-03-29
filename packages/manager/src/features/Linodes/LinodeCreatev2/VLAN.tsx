import React from 'react';

import { Accordion } from 'src/components/Accordion';
import { Link } from 'src/components/Link';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { VLANSelect } from 'src/components/VLANSelect';

import { VLANAvailabilityNotice } from '../LinodesCreate/VLANAvailabilityNotice';
import { useInterfaces, useLinodeCreateQueryParams } from './utilities';

export const VLAN = () => {
  const {
    append,
    existsInPayload,
    index,
    interfaceItem,
    update,
    remove,
  } = useInterfaces('vlan');

  const { params } = useLinodeCreateQueryParams();

  const onVlanChange = (label: null | string) => {
    if (label === null && existsInPayload) {
      return remove(index);
    }

    if (!existsInPayload) {
      append([
        { ipam_address: '', label: '', purpose: 'public' },
        { ipam_address: '', label, purpose: 'vlan' },
      ]);
    } else {
      update(index, { ...interfaceItem!, label });
    }
  };

  const onIPAMChange = (value: string) => {
    update(index, { ...interfaceItem!, ipam_address: value });
  };

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
      <VLANSelect
        onChange={onVlanChange}
        value={interfaceItem?.label ?? null}
      />
      <TextField
        disabled={!existsInPayload}
        label="IPAM Address"
        onChange={(e) => onIPAMChange(e.target.value)}
        optional
        placeholder="192.0.2.0/24"
        value={interfaceItem?.ipam_address ?? ''}
      />
    </Accordion>
  );
};
