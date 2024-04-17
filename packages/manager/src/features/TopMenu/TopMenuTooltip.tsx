import * as React from 'react';

import { Tooltip } from 'src/components/Tooltip';

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
    color: '#606469',
  },
  color: '#c9c7c7',
  [theme.breakpoints.down('sm')]: {
    padding: 1,
  },
});
