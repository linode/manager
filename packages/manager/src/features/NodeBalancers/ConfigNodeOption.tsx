import { Stack, Typography } from '@linode/ui';
import { Box } from '@mui/material';
import React from 'react';

import type { NodeOption } from './ConfigNodeIPSelect';

interface NodeOptionProps {
  listItemProps: React.HTMLAttributes<HTMLLIElement>;
  option: NodeOption;
}

export const ConfigNodeOption = ({
  option,
  listItemProps,
}: NodeOptionProps) => {
  const vpcIPEnabled = 'subnet' in option;
  const ipType = React.useMemo(() => {
    if (vpcIPEnabled) {
      return 'VPC IPv4';
    }
    if (option.label.includes(':')) {
      return 'Public';
    }
    return 'Private';
  }, [vpcIPEnabled, option.label]);

  return (
    <li {...listItemProps}>
      <Box
        alignItems="center"
        display="flex"
        flexDirection="row"
        gap={1}
        justifyContent="space-between"
        width="100%"
      >
        <Stack>
          <Typography
            color="inherit"
            sx={(theme) => ({
              font: theme.font.bold,
            })}
          >
            {option.linode.label}
          </Typography>
          {vpcIPEnabled && (
            <Typography color="inherit">{option.subnet?.label}</Typography>
          )}
          <Typography color="inherit">{option.label}</Typography>
        </Stack>
        <Box flexGrow={1} />
        {ipType}
      </Box>
    </li>
  );
};
