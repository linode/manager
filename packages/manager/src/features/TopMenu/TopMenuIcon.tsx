import * as React from 'react';
import Tooltip from 'src/components/core/Tooltip';
import { styled } from '@mui/material/styles';

interface Props {
  title: string;
  children: JSX.Element;
}

export const StyledTopMenuSvgWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'inherit',
  border: 'none',
  color: '#c9c7c7',
  cursor: 'pointer',
  height: '100%',
  outlineOffset: 'initial',
  position: 'relative',
  padding: 8,
  margin: 0,
  [theme.breakpoints.up('sm')]: {
    padding: '8px 12px',
  },
  [theme.breakpoints.down(370)]: {
    padding: 3,
  },
  '&:hover, &:focus': {
    color: '#606469',
  },
  '& svg': {
    height: 20,
    width: 20,
  },
}));

export const TopMenuIcon = ({ title, children }: Props) => {
  return (
    <Tooltip
      title={title}
      disableTouchListener
      enterDelay={500}
      leaveDelay={0}
      describeChild={true}
    >
      {children}
    </Tooltip>
  );
};

export default React.memo(TopMenuIcon);
