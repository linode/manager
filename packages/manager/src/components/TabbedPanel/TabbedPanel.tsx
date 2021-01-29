import * as React from 'react';
import Paper from 'src/components/core/Paper';
import Tab from 'src/components/core/ReachTab';
import TabList from 'src/components/core/ReachTabList';
import TabPanel from 'src/components/core/ReachTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from '../Notice';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1
  },
  inner: {
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(3)
    }
  },
  copy: {
    fontSize: '0.875rem',
    marginTop: theme.spacing(1)
  },
  panelBody: {
    padding: `${theme.spacing(2)}px 0 0`
  },
  tabsWrapper: {
    position: 'relative'
  },
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
    '&[data-reach-tab-list]': {
      background: 'none !important',
      boxShadow: `inset 0 -1px 0 ${theme.cmrBorderColors.borderTabs}`,
      marginTop: 22,
      marginBottom: theme.spacing(3),
      [theme.breakpoints.down('md')]: {
        overflowX: 'scroll',
        padding: 1
      }
    }
  },
  tabPanelOuter: {},
  tabPanel: {}
}));

export interface Tab {
  title: string;
  render: (props: any) => JSX.Element | null;
}

interface Props {
  header: string;
  error?: string | JSX.Element;
  copy?: string;
  rootClass?: string;
  innerClass?: string;
  tabs: Tab[];
  [index: string]: any;
  initTab?: number;
  bodyClass?: string;
  noPadding?: boolean;
  handleTabChange?: (index: number) => void;
  value?: number;
}

type CombinedProps = Props;

export const TabbedPanel: React.FC<CombinedProps> = props => {
  const {
    header,
    error,
    copy,
    rootClass,
    innerClass,
    tabs,
    handleTabChange,
    ...rest
  } = props;

  const classes = useStyles();

  return (
    <Paper className={`${classes.root} ${rootClass}`} data-qa-tp={header}>
      <div className={`${classes.inner} ${innerClass}`}>
        {error && <Notice error>{error}</Notice>}
        {header !== '' && (
          <Typography variant="h2" data-qa-tp-title>
            {header}
          </Typography>
        )}
        {copy && (
          <Typography component="div" className={classes.copy} data-qa-tp-copy>
            {copy}
          </Typography>
        )}

        <Tabs className={classes.tabsWrapper} onChange={handleTabChange}>
          <TabList className={classes.tabList}>
            {tabs.map((tab, idx) => (
              <Tab className={classes.tab} key={`tabs-${tab.title}-${idx}`}>
                {tab.title}
              </Tab>
            ))}
          </TabList>

          <TabPanels className={classes.tabPanelOuter}>
            {tabs.map((tab, idx) => (
              <TabPanel
                className={classes.tabPanel}
                key={`tabs-panel-${tab.title}-${idx}`}
              >
                {tab.render(rest.children)}
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </div>
    </Paper>
  );
};

export default React.memo(TabbedPanel);
