import { Link } from '@reach/router';
import * as React from 'react';
import Tab from 'src/components/core/ReachTab';
import TabList from 'src/components/core/ReachTabList';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  tab: {
    '&[data-reach-tab]': {
      // This was copied over from our MuiTab styling in themeFactory. Some of this could probably be cleaned up.
      display: 'inline-flex',
      alignItems: 'center',
      flexShrink: 0,
      verticalAlign: 'middle',
      justifyContent: 'center',
      appearance: 'none',
      borderBottom: '2px solid transparent',
      boxSizing: 'border-box',
      color: theme.cmrTextColors.textTab,
      fontSize: '0.93rem',
      lineHeight: 1.3,
      maxWidth: 264,
      minHeight: theme.spacing(1) * 6,
      minWidth: 50,
      overflow: 'hidden',
      padding: '6px 16px',
      position: 'relative',
      textTransform: 'inherit',
      [theme.breakpoints.up('md')]: {
        minWidth: 75
      },
      '&:hover': {
        color: theme.color.blue
      }
    },
    '&[data-reach-tab][data-selected]': {
      fontFamily: theme.font.bold,
      color: theme.cmrTextColors.textTabActive,
      borderBottom: `2px solid ${theme.cmrBorderColors.borderTabActive}`
    }
  },
  tabList: {
    color: theme.color.tableHeaderText,
    '&[data-reach-tab-list]': {
      background: 'none !important',
      boxShadow: `inset 0 -1px 0 ${theme.cmrBorderColors.borderTabs}`,
      marginBottom: theme.spacing(3),
      [theme.breakpoints.down('md')]: {
        overflowX: 'scroll',
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
}

type CombinedProps = Props;

export const TabLinkList: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { tabs } = props;

  return (
    <TabList className={classes.tabList}>
      {tabs.map((tab, _index) => (
        <Tab
          className={classes.tab}
          key={`tab-${_index}`}
          as={Link}
          to={tab.routeName}
        >
          {tab.title}
        </Tab>
      ))}
    </TabList>
  );
};

export default TabLinkList;
