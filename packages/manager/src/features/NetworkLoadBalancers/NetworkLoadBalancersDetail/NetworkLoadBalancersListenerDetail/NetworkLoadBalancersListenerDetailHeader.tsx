import { Box, Typography } from '@linode/ui';
import * as React from 'react';

import { EntityHeader } from 'src/components/EntityHeader/EntityHeader';

interface Props {
  label: string;
}

export const NetworkLoadBalancersListenerDetailHeader = ({ label }: Props) => {
  return (
    <EntityHeader>
      <Box>
        <Typography
          sx={(theme) => ({
            font: theme.font.bold,
            padding: '13px 16px',
          })}
        >
          Listener: {label}
        </Typography>
      </Box>
    </EntityHeader>
  );
};
