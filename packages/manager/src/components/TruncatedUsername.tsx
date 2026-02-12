import { Tooltip, Typography } from '@linode/ui';
import { truncateEnd } from '@linode/utilities';
import * as React from 'react';
import type { ComponentProps } from 'react';

import type { SxProps, Theme } from '@linode/ui';

interface Props {
  /**
   * Optional Styles
   */
  sx?: SxProps<Theme>;
  /**
   * Optional tooltip placement
   * @default 'bottom'
   */
  tooltipPlacement?: ComponentProps<typeof Tooltip>['placement'];
  /** The username to truncate
   */
  username: string;
}

/**
 * A TruncatedUsername component that has the following features
 * - Truncates usernames longer than 32 characters
 * - Shows full username in a tooltip on hover if it exceeds 32 characters
 *
 * Note: This component is reused across CM and is not IAM-specific.
 * It handles usernames longer than 32 characters by truncating them and showing a tooltip.
 * While regular usernames are limited to 32 characters by validation,
 * this is mainly used for delegate usernames that has format: {delegate-parentUsername-HASH}.
 */
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
