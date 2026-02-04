import { Tooltip, Typography } from '@linode/ui';
import { truncateEnd } from '@linode/utilities';
import * as React from 'react';

import type { SxProps, Theme } from '@linode/ui';

interface Props {
  placement?: 'bottom' | 'left' | 'right' | 'top';
  sx?: SxProps<Theme>;
  username: string;
}

export const TruncatedUsername = (props: Props) => {
  const { username, placement = 'bottom', sx } = props;

  return (
    <Tooltip
      placement={placement}
      title={username.length > 32 ? username : null}
    >
      <Typography
        sx={{
          ...sx,
        }}
      >
        {truncateEnd(username, 32)}
      </Typography>
    </Tooltip>
  );
};
