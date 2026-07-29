import { Chip } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import type { ApiKeyStatus } from '@linode/api-v4';

export interface StatusBadgeProps {
  status: ApiKeyStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const theme = useTheme();
  const isDarkMode = theme.name === 'dark';

  const statusStyles: Record<
    ApiKeyStatus,
    { backgroundColor: string; color: string }
  > = {
    active: {
      backgroundColor: isDarkMode
        ? theme.tokens.color.Green[80]
        : theme.tokens.color.Green[70],
      color: theme.palette.common.white,
    },
    expired: {
      backgroundColor: isDarkMode
        ? theme.tokens.color.Orange[80]
        : theme.tokens.color.Orange[70],
      color: theme.palette.common.white,
    },
    revoked: {
      backgroundColor: isDarkMode
        ? theme.tokens.color.Neutrals[40]
        : theme.tokens.color.Neutrals[30],
      color: theme.tokens.color.Neutrals.Black,
    },
  };

  return (
    <Chip
      label={status}
      size="small"
      sx={{
        ...statusStyles[status],
        fontSize: '0.75rem',
        height: 24,
        textTransform: 'capitalize',
      }}
    />
  );
};
