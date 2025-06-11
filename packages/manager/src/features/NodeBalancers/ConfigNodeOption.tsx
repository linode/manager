import { SelectedIcon, Stack, Typography } from '@linode/ui';
import { Box } from '@mui/material';
import React from 'react';

import type { NodeOption } from './ConfigNodeIPSelect';

interface NodeOptionProps {
  listItemProps: React.HTMLAttributes<HTMLLIElement>;
  option: NodeOption;
  selected: boolean;
}

export const ConfigNodeOption = ({
  option,
  listItemProps,
  selected,
}: NodeOptionProps) => {
  const vpcIPEnabled = 'subnet' in option;
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
            {option.label}
          </Typography>
          <Typography color="inherit">{option.linode.label}</Typography>
        </Stack>
        <Box flexGrow={1} />
        {vpcIPEnabled
          ? `${option.subnet?.label}`
          : selected && <SelectedIcon visible />}
      </Box>
    </li>
  );
};
