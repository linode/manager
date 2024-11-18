import { Tooltip } from '@linode/ui';
import * as React from 'react';

import type { Theme } from '@mui/material';

interface Props {
  children: JSX.Element;
  title: string;
}

export const TopMenuTooltip = React.memo(({ children, title }: Props) => {
  return (
    <Tooltip
      describeChild={true}
      disableTouchListener
      enterDelay={500}
      leaveDelay={0}
      title={title}
    >
      <div>{children}</div>
    </Tooltip>
  );
});

export const topMenuIconButtonSx = (theme: Theme) => ({
  '&:hover, &:focus': {
    color: theme.tokens.color.Neutrals[70],
  },
  color: theme.tokens.color.Neutrals[40],
  height: `50px`,
  [theme.breakpoints.down('sm')]: {
    padding: 1,
  },
});
