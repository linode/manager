import { Link } from '@reach/router';
import * as React from 'react';
import Tab from 'src/components/core/ReachTab';
import TabList from 'src/components/core/ReachTabList';
import { makeStyles, Theme } from 'src/components/core/styles';
import { CreateTypes } from 'src/store/linodeCreate/linodeCreate.actions';

const useStyles = makeStyles((theme: Theme) => ({
  tab: {
    '&[data-reach-tab]': {
      // This was copied over from our MuiTab styling in themeFactory. Some of this could probably be cleaned up.
      color: theme.color.tableHeaderText,
      minWidth: 50,
      textTransform: 'inherit',
      fontSize: '0.93rem',
      padding: '6px 16px',
      position: 'relative',
      overflow: 'hidden',
      maxWidth: 264,
      boxSizing: 'border-box',
      borderBottom: '2px solid transparent',
      minHeight: theme.spacing(1) * 6,
      flexShrink: 0,
      display: 'inline-flex',
      alignItems: 'center',
      verticalAlign: 'middle',
      justifyContent: 'center',
      appearance: 'none',
      lineHeight: 1.3,
      [theme.breakpoints.up('md')]: {
        minWidth: 75
      },
      '&:hover': {
        color: theme.color.blue
      }
    },
    '&[data-reach-tab][data-selected]': {
      fontFamily: theme.font.bold,
      color: theme.color.headline,
      borderBottom: `2px solid ${theme.color.blue}`
    }
  },
  tabList: {
    '&[data-reach-tab-list]': {
      background: 'none !important',
      boxShadow: `inset 0 -1px 0 ${theme.color.border2}`,
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
  type?: CreateTypes;
}

interface Props {
  tabs: Tab[];
  [index: string]: any;
}

type CombinedProps = Props;

export const TabLinkList: React.FC<CombinedProps> = props => {
  const { tabs } = props;

  const classes = useStyles();

  return (
    <TabList className={classes.tabList}>
      {tabs.map((tab, _index) => (
        <Tab
          className={classes.tab}
          key={`tab-${_index}`}
          as={Link}
          to={tab.routeName}
          type={tab.type}
        >
          {tab.title}
        </Tab>
      ))}
    </TabList>
  );
};

export default TabLinkList;
