import { styled } from '@mui/material/styles';
import { TabList as ReachTabList } from '@reach/tabs';
import * as React from 'react';

import type { TabListProps } from '@reach/tabs';

interface TabListPropsWithClassName extends TabListProps {
  className?: string;
}

const TabList = ({
  children,
  className,
  ...rest
}: TabListPropsWithClassName) => {
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
    boxShadow: `inset 0 -1px 0 ${theme.borderColors.divider}`,
    marginBottom: theme.spacingFunction(16),
    [theme.breakpoints.down('lg')]: {
      overflowX: 'auto',
      padding: 1,
    },
  },
  color: theme.color.tableHeaderText,
}));
