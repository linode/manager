import { Box, List, ListItem, Stack, Typography } from '@linode/ui';
import * as React from 'react';

import type { Theme } from '@mui/material';

export const STRENGTHEN_TEMPLATE_RULES = (
  <Typography>
    For improved security, narrow the allowed IPv4 and IPv6 ranges in the{' '}
    <strong>Allow Inbound SSH Sources</strong> rule.
  </Typography>
);

export const PublicTemplateRules = () => {
  return (
    <>
      <Stack marginTop={2} spacing={2}>
        <Typography>
          This rule set is a starting point for Public Linode Interfaces. It
          allows SSH access and essential networking control traffic.
        </Typography>
        {STRENGTHEN_TEMPLATE_RULES}
        <Box
          data-testid="public-template-info"
          sx={(theme) => ({
            backgroundColor: theme.tokens.alias.Background.Neutral,
            padding: theme.spacingFunction(16),
          })}
        >
          {sharedTemplateRules}
        </Box>
      </Stack>
      {sharedTemplatePolicies}
    </>
  );
};

const templateRuleStyling = (theme: Theme) => ({
  backgroundColor: theme.tokens.alias.Background.Neutral,
  padding: `${theme.spacingFunction(8)} ${theme.spacingFunction(16)}`,
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
  <Stack marginTop={1} spacing={1}>
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
  </Stack>
);
