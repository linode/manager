import * as React from 'react';
import { TabList as ReachTabList, TabListProps } from '@reach/tabs';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import classNames from 'classnames';

const useStyles = makeStyles((theme: Theme) => ({
  tabList: {
    color: theme.color.tableHeaderText,
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
  },
}));

const TabList: React.FC<TabListProps & { className?: string }> = ({
  children,
  className,
  ...rest
}) => {
  const classes = useStyles();

  return (
    <ReachTabList className={classNames(classes.tabList, className)} {...rest}>
      {children}
    </ReachTabList>
  );
};

export default TabList;
