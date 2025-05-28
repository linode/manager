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
  const privateIPEnabled = 'linode' in option;
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
          <Typography color="inherit">
            {privateIPEnabled
              ? `${option.linode.label}`
              : `${option.linodeLabel}`}
          </Typography>
        </Stack>
        <Box flexGrow={1} />
        {!privateIPEnabled
          ? `${option.subnetLabel}`
          : selected && <SelectedIcon visible />}
      </Box>
    </li>
  );
};
