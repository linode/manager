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
    flexGrow: 1,
    backgroundColor: theme.color.white
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
      // This was copied over from our MuiTab styling in themeFactory. Some of this could probably be cleaned up.
      color: theme.palette.cmrTextColors.textTab,
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
      color: theme.palette.cmrTextColors.textTabActive,
      borderBottom: `2px solid ${theme.palette.cmrBorderColors.borderTabActive}`
    }
  },
  tabList: {
    '&[data-reach-tab-list]': {
      background: 'none !important',
      boxShadow: `inset 0 -1px 0 ${theme.palette.cmrBorderColors.borderTabs}`,
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
        {error && <Notice text={error} error />}
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
