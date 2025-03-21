import { Box, Chip, Stack, Typography } from '@linode/ui';
import React from 'react';

import { getLinodeInterfaceType } from '../utilities';
import { PublicInterfaceDetailsContent } from './PublicInterfaceDetailsContent';
import { VlanInterfaceDetailsContent } from './VlanInterfaceDetailsContent';
import { VPCInterfaceDetailsContent } from './VPCInterfaceDetailsContent';

import type { LinodeInterface } from '@linode/api-v4';
import type { Theme } from '@mui/material';

export const InterfaceDetailsContent = (props: LinodeInterface) => {
  const { created, default_route, id, mac_address, updated } = props;
  const type = getLinodeInterfaceType(props);

  return (
    <Stack>
      {(default_route.ipv4 || default_route.ipv6) && (
        <Box marginBottom={2}>
          {default_route.ipv4 && (
            <Chip
              sx={(theme) => ({
                ...chipStyles(theme),
                marginLeft: 0,
              })}
              component="span"
              label="IPv4 Default Route"
            />
          )}
          {default_route.ipv6 && (
            <Chip
              sx={(theme) => ({
                ...chipStyles(theme),
              })}
              component="span"
              label="IPv6 Default Route"
            />
          )}
        </Box>
      )}
      <Typography>
        <strong>Type</strong>
      </Typography>
      <Typography>{type}</Typography>
      <Typography sx={(theme) => ({ marginTop: theme.spacingFunction(16) })}>
        <strong>ID</strong>
      </Typography>
      <Typography>{id}</Typography>
      <Typography sx={(theme) => ({ marginTop: theme.spacingFunction(16) })}>
        <strong>MAC Address</strong>
      </Typography>
      <Typography>{mac_address}</Typography>
      {props.public && <PublicInterfaceDetailsContent {...props.public} />}
      {props.vpc && <VPCInterfaceDetailsContent {...props.vpc} />}
      {props.vlan && <VlanInterfaceDetailsContent {...props.vlan} />}
      <Typography sx={(theme) => ({ marginTop: theme.spacingFunction(16) })}>
        <strong>Created</strong>
      </Typography>
      <Typography>{created}</Typography>
      <Typography sx={(theme) => ({ marginTop: theme.spacingFunction(16) })}>
        <strong>Modified</strong>
      </Typography>
      <Typography>{updated}</Typography>
    </Stack>
  );
};

const chipStyles = (theme: Theme) => ({
  backgroundColor: theme.color.tagButtonBg,
  color: theme.tokens.color.Neutrals[80],
  marginLeft: theme.spacing(0.5),
});
