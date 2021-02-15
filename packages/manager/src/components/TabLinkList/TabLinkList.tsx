import { Link } from '@reach/router';
import * as React from 'react';
import Tab from 'src/components/core/ReachTab';
import TabList from 'src/components/core/ReachTabList';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  tab: {
    '&[data-reach-tab]': {
      display: 'inline-flex',
      flexShrink: 0,
      alignItems: 'center',
      borderBottom: '2px solid transparent',
      color: theme.cmrTextColors.linkActiveLight,
      fontSize: '0.9rem',
      lineHeight: 1.3,
      marginTop: theme.spacing(0.5),
      maxWidth: 264,
      minHeight: theme.spacing(5),
      minWidth: 50,
      padding: '6px 16px',
      textDecoration: 'none',
      '&:hover': {
        color: theme.color.blue
      }
    },
    '&[data-reach-tab][data-selected]': {
      borderBottom: `3px solid ${theme.cmrTextColors.linkActiveLight}`,
      color: theme.cmrTextColors.headlineStatic,
      fontFamily: theme.font.bold
    }
  },
  tabList: {
    color: theme.color.tableHeaderText,
    '&[data-reach-tab-list]': {
      background: 'none !important',
      boxShadow: `inset 0 -1px 0 ${theme.cmrBorderColors.borderTabs}`,
      marginBottom: theme.spacing(),
      [theme.breakpoints.down('md')]: {
        overflowX: 'auto',
        padding: 1
      }
    }
  }
}));

export interface Tab {
  title: string;
  routeName: string;
}

interface Props {
  tabs: Tab[];
  [index: string]: any;
  noLink?: boolean; // @todo: remove this prop if we use NavTab widely.
}

type CombinedProps = Props;

export const TabLinkList: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { tabs } = props;

  return (
    <TabList className={classes.tabList}>
      {tabs.map((tab, _index) => {
        // @todo: remove this if we use NavTab widely.
        const extraTemporaryProps: any = props.noLink
          ? {}
          : { as: Link, to: tab.routeName };

        return (
          <Tab
            className={classes.tab}
            key={`tab-${_index}`}
            // @todo: remove this if we use NavTab widely.
            {...extraTemporaryProps}
          >
            {tab.title}
          </Tab>
        );
      })}
    </TabList>
  );
};

export default TabLinkList;
