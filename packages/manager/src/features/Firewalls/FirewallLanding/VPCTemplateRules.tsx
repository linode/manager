import { Box, List, ListItem, Stack, Typography } from '@linode/ui';
import * as React from 'react';

import { TextTooltip } from 'src/components/TextTooltip';

import { STRENGTHEN_TEMPLATE_RULES } from './PublicTemplateRules';
import {
  sharedTemplatePolicies,
  sharedTemplateRules,
} from './PublicTemplateRules';

export const VPCTemplateRules = () => {
  return (
    <>
      <Stack marginTop={2} spacing={2}>
        <Typography>
          This rule set is a starting point for VPC Linode Interfaces. It allows
          SSH access, essential networking control traffic, and inbound traffic
          from the VPC address space.
        </Typography>
        {STRENGTHEN_TEMPLATE_RULES}
        <Box
          data-testid="vpc-template-info"
          sx={(theme) => ({
            backgroundColor: theme.tokens.alias.Background.Neutral,
            padding: theme.spacingFunction(16),
          })}
        >
          {sharedTemplateRules}
          <Typography
            sx={(theme) => ({ marginTop: theme.spacingFunction(16) })}
          >
            Allow traffic for{' '}
            <TextTooltip
              displayText="RFC1918"
              tooltipText="RFC1918 defines the IP address ranges that are reserved for private networks—these IPs are not routable on the public internet and are commonly used in internal networking (like VPCs)."
            />{' '}
            ranges
          </Typography>
          <List dense sx={{ listStyleType: 'disc', pl: 3 }}>
            <ListItem disablePadding sx={{ display: 'list-item' }}>
              Protocol: TCP, UDP
            </ListItem>
            <ListItem disablePadding sx={{ display: 'list-item' }}>
              Ports: All Ports
            </ListItem>
            <ListItem disablePadding sx={{ display: 'list-item' }}>
              Sources: 10.0.0.0/8, 192.168.0.0/17, 172.16.0.0/12
            </ListItem>
          </List>
        </Box>
      </Stack>
      {sharedTemplatePolicies}
    </>
  );
};
