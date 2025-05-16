import { Box, Chip, Stack, Typography } from '@linode/ui';
import React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { MaskableText } from 'src/components/MaskableText/MaskableText';

import { getLinodeInterfaceType } from '../utilities';
import { PublicInterfaceDetailsContent } from './PublicInterfaceDetailsContent';
import { VlanInterfaceDetailsContent } from './VlanInterfaceDetailsContent';
import { VPCInterfaceDetailsContent } from './VPCInterfaceDetailsContent';

import type { LinodeInterface } from '@linode/api-v4';

export const InterfaceDetailsContent = (props: LinodeInterface) => {
  const { created, default_route, id, mac_address, updated, version } = props;
  const type = getLinodeInterfaceType(props);

  return (
    <Stack gap={2}>
      {(default_route.ipv4 || default_route.ipv6) && (
        <Box>
          {default_route.ipv4 && (
            <Chip color="info" component="span" label="IPv4 Default Route" />
          )}
          {default_route.ipv6 && (
            <Chip color="info" component="span" label="IPv6 Default Route" />
          )}
        </Box>
      )}
      <Stack>
        <Typography>
          <strong>Type</strong>
        </Typography>
        <Typography>{type}</Typography>
      </Stack>
      <Stack>
        <Typography>
          <strong>ID</strong>
        </Typography>
        <Typography>{id}</Typography>
      </Stack>
      <Stack>
        <Typography>
          <strong>MAC Address</strong>
        </Typography>
        <MaskableText isToggleable text={mac_address} />
      </Stack>
      {props.public && <PublicInterfaceDetailsContent {...props.public} />}
      {props.vpc && <VPCInterfaceDetailsContent {...props.vpc} />}
      {props.vlan && <VlanInterfaceDetailsContent {...props.vlan} />}
      <Stack>
        <Typography>
          <strong>Version</strong>
        </Typography>
        <Typography>{version}</Typography>
      </Stack>
      <Stack>
        <Typography>
          <strong>Created</strong>
        </Typography>
        <Typography>
          <DateTimeDisplay value={created} />
        </Typography>
      </Stack>
      <Stack>
        <Typography>
          <strong>Modified</strong>
        </Typography>
        <Typography>
          <DateTimeDisplay value={updated} />
        </Typography>
      </Stack>
    </Stack>
  );
};
