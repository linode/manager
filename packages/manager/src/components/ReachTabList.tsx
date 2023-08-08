import { styled } from '@mui/material/styles';
import { TabList as ReachTabList, TabListProps } from '@reach/tabs';
import * as React from 'react';

const TabList = ({
  children,
  className,
  ...rest
}: TabListProps & { className?: string }) => {
  return (
    <StyledReachTabList className={className} {...rest}>
      {children}
    </StyledReachTabList>
  );
};

export { TabList };

const StyledReachTabList = styled(ReachTabList)(({ theme }) => ({
  '&[data-reach-tab-list]': {
    background: 'none !important',
    boxShadow: `inset 0 -1px 0 ${
      theme.name === 'light' ? '#e3e5e8' : '#2e3238'
    }`,
    marginBottom: theme.spacing(),
    [theme.breakpoints.down('lg')]: {
      overflowX: 'auto',
      padding: 1,
    },
  },
  color: theme.color.tableHeaderText,
}));
