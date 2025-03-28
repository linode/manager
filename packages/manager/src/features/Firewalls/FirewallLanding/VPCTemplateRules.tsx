import { Box, List, ListItem, Stack, Typography } from '@linode/ui';
import * as React from 'react';

import { TextTooltip } from 'src/components/TextTooltip';

import { STRENGTHEN_TEMPLATE_RULES } from './constants';
import {
  sharedTemplatePolicies,
  sharedTemplateRules,
} from './PublicTemplateRules';

export const VPCTemplateRules = () => {
  return (
    <>
      <Stack marginTop={3} spacing={2}>
        <Typography>
          Allows for login with SSH, regular networking control data, and
          inbound traffic from the VPC address space.
        </Typography>
        <Typography>{STRENGTHEN_TEMPLATE_RULES}</Typography>
        <Box
          sx={(theme) => ({
            backgroundColor: theme.tokens.alias.Background.Neutral,
            padding: theme.spacingFunction(16),
          })}
          data-testid="vpc-template-info"
        >
          {sharedTemplateRules}
          <Typography
            sx={(theme) => ({ marginTop: theme.spacingFunction(16) })}
          >
            Allow traffic for{' '}
            <TextTooltip
              displayText="RFC1918"
              tooltipText="The RFC reserves the following ranges of IP addresses that cannot be routed on the Internet."
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
