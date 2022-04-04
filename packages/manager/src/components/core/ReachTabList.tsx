import * as React from 'react';
import { TabList as ReachTabList, TabListProps } from '@reach/tabs';
import { makeStyles, Theme } from './styles';

const useStyles = makeStyles((theme: Theme) => ({
  tabList: {
    color: theme.color.tableHeaderText,
    '&[data-reach-tab-list]': {
      background: 'none !important',
      boxShadow: `inset 0 -1px 0 ${
        theme.name === 'lightTheme' ? '#e3e5e8' : '#2e3238'
      }`,
      marginBottom: theme.spacing(),
      [theme.breakpoints.down('md')]: {
        overflowX: 'auto',
        padding: 1,
      },
    },
  },
}));

const TabList: React.FC<TabListProps> = ({ children, ...rest }) => {
  const classes = useStyles();

  return (
    <ReachTabList className={classes.tabList} {...rest}>
      {children}
    </ReachTabList>
  );
};

export default TabList;
