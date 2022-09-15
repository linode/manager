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
import Grid from 'src/components/Grid';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
  },
  copy: {
    fontSize: '0.875rem',
    marginTop: theme.spacing(1),
  },
  panelBody: {
    padding: `${theme.spacing(2)}px 0 0`,
  },
  tabsWrapper: {
    position: 'relative',
  },
  tab: {
    '&[data-reach-tab]': {
      '&:focus': {
        backgroundColor: theme.bg.tableHeader,
      },
      '&:hover': {
        backgroundColor: theme.bg.tableHeader,
      },
    },
  },
  tabList: {
    '&[data-reach-tab-list]': {
      boxShadow: `inset 0 -1px 0 ${theme.borderColors.divider}`,
      marginTop: 22,
      marginBottom: theme.spacing(3),
    },
  },
  header: {
    display: 'flex',
  },
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
  docsLink?: JSX.Element;
}

type CombinedProps = Props;

export const TabbedPanel: React.FC<CombinedProps> = (props) => {
  const {
    header,
    error,
    copy,
    rootClass,
    innerClass,
    tabs,
    handleTabChange,
    docsLink,
    ...rest
  } = props;

  const classes = useStyles();

  return (
    <Paper className={`${classes.root} ${rootClass}`} data-qa-tp={header}>
      <div className={innerClass}>
        {error && <Notice error>{error}</Notice>}
        <Grid className={classes.header}>
          {header !== '' && (
            <Grid item xs={6}>
              <Typography variant="h2" data-qa-tp-title>
                {header}
              </Typography>
            </Grid>
          )}
          {docsLink ? (
            <Grid
              item
              xs={6}
              style={{ display: 'flex', flexDirection: 'row-reverse' }}
            >
              {docsLink}
            </Grid>
          ) : null}
        </Grid>
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

          <TabPanels>
            {tabs.map((tab, idx) => (
              <TabPanel key={`tabs-panel-${tab.title}-${idx}`}>
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
