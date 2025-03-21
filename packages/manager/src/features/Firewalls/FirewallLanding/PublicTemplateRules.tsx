import { Box, List, ListItem, Typography } from '@linode/ui';
import * as React from 'react';

import { STRENGTHEN_TEMPLATE_RULES } from './constants';

import type { Theme } from '@mui/material';

export const PublicTemplateRules = () => {
  return (
    <>
      <Typography sx={(theme) => ({ marginTop: theme.spacingFunction(24) })}>
        Allows for login with SSH, and regular networking control data.
      </Typography>
      <Typography sx={(theme) => ({ marginTop: theme.spacingFunction(16) })}>
        {STRENGTHEN_TEMPLATE_RULES}
      </Typography>
      <Box
        sx={(theme) => ({
          backgroundColor: theme.tokens.alias.Background.Neutral,
          marginTop: theme.spacingFunction(16),
          padding: theme.spacingFunction(16),
        })}
        data-testid="public-template-info"
      >
        {sharedTemplateRules}
      </Box>
      {sharedTemplatePolicies}
    </>
  );
};

const templateRuleStyling = (theme: Theme) => ({
  backgroundColor: theme.tokens.alias.Background.Neutral,
  marginTop: theme.spacingFunction(8),
  padding: `${theme.spacingFunction(8)} ${theme.spacingFunction(8)}`,
});

export const sharedTemplateRules = (
  <>
    <Typography variant="h3">Rules</Typography>
    <Typography sx={(theme) => ({ marginTop: theme.spacingFunction(8) })}>
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
    <Typography sx={(theme) => ({ marginTop: theme.spacingFunction(16) })}>
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
  </>
);

export const sharedTemplatePolicies = (
  <>
    <Box
      sx={(theme) => ({
        ...templateRuleStyling(theme),
      })}
    >
      <Typography variant="subtitle1">Default Inbound Policy: DROP</Typography>
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
