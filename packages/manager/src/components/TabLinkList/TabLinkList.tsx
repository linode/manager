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
      color: theme.color.tableHeaderText,
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
      color: theme.color.headline,
      borderBottom: `2px solid ${theme.color.blue}`
    }
  },
  tabList: {
    color: theme.color.tableHeaderText,
    '&[data-reach-tab-list]': {
      background: 'none !important',
      boxShadow: `inset 0 -1px 0 ${theme.color.border2}`,
      marginBottom: theme.spacing(3),
      [theme.breakpoints.down('md')]: {
        overflowX: 'scroll',
        padding: 1
      }
    }
  },
  lishTab: {
    backgroundColor: theme.bg.offWhite,
    color: theme.color.tableHeaderText,
    '&[aria-selected="true"]': {
      backgroundColor: theme.palette.primary.main,
      borderBottom: 'none !important',
      color: 'white !important',
      '&:hover': {
        backgroundColor: theme.palette.primary.light,
        color: 'white'
      }
    }
  },
  lishTabList: {
    display: 'flex',
    backgroundColor: theme.bg.offWhite,
    margin: 0,
    overflow: 'hidden',
    '& [role="tab"]': {
      flexBasis: '50%',
      margin: 0,
      maxWidth: 'none !important',
      transition: theme.transitions.create('background-color')
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
  lish?: boolean;
}

type CombinedProps = Props;

export const TabLinkList: React.FC<CombinedProps> = props => {
  const { tabs } = props;

  const classes = useStyles();

  const h1Header = React.useRef<HTMLDivElement>(null);
  const selected = document.querySelector('data-selected');

  React.useEffect(() => {
    if (selected) {
      selected.focus();
    }
  }, [selected]);

  return (
    <TabList className={props.lish ? classes.lishTabList : classes.tabList}>
      {tabs.map((tab, _index) => (
        <Tab
          className={`${classes.tab} ${props.lish ? classes.lishTab : ''}`}
          key={`tab-${_index}`}
          as={Link}
          to={tab.routeName}
          // innerRef={h1Header}
        >
          {tab.title}
        </Tab>
      ))}
    </TabList>
  );
};

export default TabLinkList;
