import { Box, List, ListItem, Typography } from '@linode/ui';
import * as React from 'react';

import { TextTooltip } from 'src/components/TextTooltip';

import type { Theme } from '@mui/material';

export const VPCTemplateRules = () => {
  return (
    <>
      <Typography sx={(theme) => ({ marginTop: theme.spacing(2) })}>
        Allows for login with SSH, regular networking control data, and inbound
        traffice from the VPC address space.
      </Typography>
      <Typography sx={(theme) => ({ marginTop: theme.spacing(2) })}>
        It is recommended to further strengthen these rules by limiting the
        allowed IPv4 and IPv6 ranges.
      </Typography>
      <Box
        sx={(theme) => ({
          backgroundColor: theme.tokens.background.Neutral,
          marginTop: theme.spacing(2),
          padding: theme.spacing(2),
        })}
      >
        <Typography variant="subtitle1">Rules</Typography>
        <Typography sx={(theme) => ({ marginTop: theme.spacing(1) })}>
          Allow Inbound SSH
        </Typography>
        <List dense sx={{ listStyleType: 'disc', pl: 3 }}>
          <ListItem disablePadding sx={{ display: 'list-item' }}>
            Protocol: TCP
          </ListItem>
          <ListItem disablePadding sx={{ display: 'list-item' }}>
            Ports: 22
          </ListItem>{' '}
          <ListItem disablePadding sx={{ display: 'list-item' }}>
            Sources: All IPv4, IPv6
          </ListItem>
        </List>
        <Typography sx={(theme) => ({ marginTop: theme.spacing(2) })}>
          Allow Inbound ICMP
        </Typography>
        <List dense sx={{ listStyleType: 'disc', pl: 3 }}>
          <ListItem disablePadding sx={{ display: 'list-item' }}>
            Protocol: ICMP
          </ListItem>
          <ListItem disablePadding sx={{ display: 'list-item' }}>
            Sources: All IPv4, IPv6
          </ListItem>
        </List>
        <Typography sx={(theme) => ({ marginTop: theme.spacing(2) })}>
          Allow traffic for{' '}
          <TextTooltip
            displayText="RFC1918"
            tooltipText="The RFC reserves the following ranges of IP addresses that cannot be routed on the Internet."
          />{' '}
          ranges
        </Typography>
        <List dense sx={{ listStyleType: 'disc', pl: 3 }}>
          <ListItem disablePadding sx={{ display: 'list-item' }}>
            Protocol: TCP
          </ListItem>
          <ListItem disablePadding sx={{ display: 'list-item' }}>
            Ports: All Ports
          </ListItem>
          <ListItem disablePadding sx={{ display: 'list-item' }}>
            Sources: 10.0.0.0/8, 192.168.0.0/17, 172.16.0.0/12
          </ListItem>
        </List>
      </Box>
      <Box
        sx={(theme) => ({
          ...templateRuleStyling(theme),
        })}
      >
        <Typography variant="subtitle1">
          Default Inbound Policy: DROP
        </Typography>
      </Box>
      <Box
        sx={(theme) => ({
          ...templateRuleStyling(theme),
        })}
      >
        <Typography variant="subtitle1">
          Default Outbound Policy: ACCEPT
        </Typography>
      </Box>
    </>
  );
};

const templateRuleStyling = (theme: Theme) => ({
  backgroundColor: theme.tokens.background.Neutral,
  marginTop: theme.spacing(1),
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
});
