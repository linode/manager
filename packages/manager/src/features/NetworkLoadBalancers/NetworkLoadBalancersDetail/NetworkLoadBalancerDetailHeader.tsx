import { NetworkLoadBalancerStatus } from '@linode/api-v4';
import { Box, Stack, Typography } from '@linode/ui';
import * as React from 'react';

import { EntityHeader } from 'src/components/EntityHeader/EntityHeader';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';

export const NetworkLoadBalancerDetailHeader = (props: {
  status: NetworkLoadBalancerStatus;
}) => {
  const { status } = props;

  const statusIcon = () => {
    if (status === 'active') {
      return 'active';
    }
    if (['canceled', 'suspended'].includes(status)) {
      return 'inactive';
    }
    return 'other';
  };

  return (
    <EntityHeader>
      <Box
        sx={(theme) => ({
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          padding: `${theme.spacingFunction(13)} 0 ${theme.spacingFunction(13)} ${theme.spacingFunction(16)}`,
        })}
      >
        <Stack
          alignItems="center"
          aria-label={`nlb status ${status}`}
          data-qa-nlb-status
          direction="row"
          spacing={1.25}
        >
          <StatusIcon status={statusIcon()} />
          <Typography
            sx={(theme) => ({
              font: theme.font.bold,
            })}
          >
            {status.toUpperCase()}
          </Typography>
        </Stack>
      </Box>
    </EntityHeader>
  );
};
