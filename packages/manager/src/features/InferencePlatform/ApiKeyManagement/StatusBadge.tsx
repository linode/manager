import { Color } from '@akamai/cds-tokens';
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
      backgroundColor: isDarkMode ? Color.Green[80] : Color.Green[70],
      color: Color.Neutrals.White,
    },
    expired: {
      backgroundColor: isDarkMode ? Color.Orange[80] : Color.Orange[70],
      color: Color.Neutrals.White,
    },
    revoked: {
      backgroundColor: isDarkMode ? Color.Neutrals[40] : Color.Neutrals[30],
      color: Color.Neutrals.Black,
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
