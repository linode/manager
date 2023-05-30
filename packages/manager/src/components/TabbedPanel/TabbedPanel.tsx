import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import { Notice } from 'src/components/Notice/Notice';
import Paper from 'src/components/core/Paper';
import Tab from 'src/components/core/ReachTab';
import TabList from 'src/components/core/ReachTabList';
import TabPanel from 'src/components/core/ReachTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import Typography from 'src/components/core/Typography';

export interface Tab {
  title: string;
  render: (props: any) => JSX.Element | null;
}

interface TabbedPanelProps {
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
  handleTabChange?: () => void;
  value?: number;
  docsLink?: JSX.Element;
}

const TabbedPanel = React.memo((props: TabbedPanelProps) => {
  const {
    header,
    error,
    copy,
    rootClass,
    innerClass,
    tabs,
    handleTabChange,
    docsLink,
    initTab,
    ...rest
  } = props;

  const [tabIndex, setTabIndex] = useState<number | undefined>(initTab);

  const tabChangeHandler = (index: number) => {
    setTabIndex(index);
    if (handleTabChange) {
      handleTabChange();
    }
  };

  useEffect(() => {
    if (tabIndex !== initTab) {
      setTabIndex(initTab);
    }
  }, [initTab]);

  return (
    <Paper className={rootClass} sx={{ flexGrow: 1 }} data-qa-tp={header}>
      <div className={innerClass}>
        {error && <Notice error>{error}</Notice>}
        <Grid container sx={{ display: 'flex' }}>
          {header !== '' && (
            <Grid xs={6}>
              <Typography variant="h2" data-qa-tp-title>
                {header}
              </Typography>
            </Grid>
          )}
          {docsLink ? (
            <Grid
              xs={6}
              style={{ display: 'flex', flexDirection: 'row-reverse' }}
            >
              {docsLink}
            </Grid>
          ) : null}
        </Grid>
        {copy && <StyledTypography data-qa-tp-copy>{copy}</StyledTypography>}

        <Tabs
          onChange={tabChangeHandler}
          index={tabIndex}
          sx={{ position: 'relative' }}
        >
          <StyledTabList>
            {tabs.map((tab, idx) => (
              <StyledTab key={`tabs-${tab.title}-${idx}`}>
                {tab.title}
              </StyledTab>
            ))}
          </StyledTabList>
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
});

export { TabbedPanel };

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  marginTop: theme.spacing(1),
}));

const StyledTabList = styled(TabList)(({ theme }) => ({
  '&[data-reach-tab-list]': {
    marginTop: 22,
    marginBottom: `${theme.spacing(3)} !important`,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  '&[data-reach-tab]': {
    '&:focus': {
      backgroundColor: theme.bg.tableHeader,
    },
    '&:hover': {
      backgroundColor: theme.bg.tableHeader,
    },
  },
}));
