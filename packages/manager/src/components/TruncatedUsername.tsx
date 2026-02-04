import { Tooltip, Typography } from '@linode/ui';
import { truncateEnd } from '@linode/utilities';
import * as React from 'react';
import type { ComponentProps } from 'react';

import type { SxProps, Theme } from '@linode/ui';

interface Props {
  sx?: SxProps<Theme>;
  tooltipPlacement?: ComponentProps<typeof Tooltip>['placement'];
  username: string;
}

export const TruncatedUsername = (props: Props) => {
  const { username, tooltipPlacement = 'bottom', sx } = props;

  return (
    <Tooltip
      placement={tooltipPlacement}
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
