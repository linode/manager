import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Tooltip } from 'src/components/Tooltip';

interface Props {
  children: JSX.Element;
  title: string;
}

export const StyledTopMenuIconWrapper = styled('div')(({ theme }) => ({
  '& svg': {
    height: 20,
    width: 20,
  },
  '&:hover, &:focus': {
    color: '#606469',
  },
  alignItems: 'center',
  backgroundColor: 'inherit',
  border: 'none',
  color: '#c9c7c7',
  cursor: 'pointer',
  display: 'flex',
  height: '100%',
  margin: 0,
  outlineOffset: 'initial',
  padding: 8,
  position: 'relative',
  [theme.breakpoints.down(370)]: {
    padding: 3,
  },
  [theme.breakpoints.up('sm')]: {
    padding: '8px 12px',
  },
}));

export const TopMenuIcon = React.memo(({ children, title }: Props) => {
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
