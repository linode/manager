import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import React, { useEffect, useState } from 'react';

import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { Tab } from 'src/components/ReachTab';
import { TabList } from 'src/components/ReachTabList';
import { TabPanel } from 'src/components/ReachTabPanel';
import { TabPanels } from 'src/components/ReachTabPanels';
import { Tabs } from 'src/components/ReachTabs';
import { Typography } from 'src/components/Typography';

export interface Tab {
  render: (props: any) => JSX.Element | null;
  title: string;
}

interface TabbedPanelProps {
  [index: string]: any;
  bodyClass?: string;
  copy?: string;
  docsLink?: JSX.Element;
  error?: JSX.Element | string;
  handleTabChange?: () => void;
  header: string;
  initTab?: number;
  innerClass?: string;
  noPadding?: boolean;
  rootClass?: string;
  sx?: SxProps;
  tabs: Tab[];
  value?: number;
}

const TabbedPanel = React.memo((props: TabbedPanelProps) => {
  const {
    copy,
    docsLink,
    error,
    handleTabChange,
    header,
    initTab,
    innerClass,
    rootClass,
    sx,
    tabs,
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
    <Paper
      className={rootClass}
      data-qa-tp={header}
      sx={{ flexGrow: 1, ...sx }}
    >
      <div className={innerClass}>
        {error && <Notice variant="error">{error}</Notice>}
        <Grid container sx={{ display: 'flex' }}>
          {header !== '' && (
            <Grid xs={6}>
              <Typography data-qa-tp-title variant="h2">
                {header}
              </Typography>
            </Grid>
          )}
          {docsLink ? (
            <Grid
              style={{ display: 'flex', flexDirection: 'row-reverse' }}
              xs={6}
            >
              {docsLink}
            </Grid>
          ) : null}
        </Grid>
        {copy && <StyledTypography data-qa-tp-copy>{copy}</StyledTypography>}

        <Tabs
          index={tabIndex}
          onChange={tabChangeHandler}
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
  'div &[data-reach-tab-list]': {
    '&button': {
      '&:focus': {
        backgroundColor: theme.bg.tableHeader,
      },
      '&:hover': {
        backgroundColor: `red !important`,
      },
    },
    boxShadow: `inset 0 -1px 0 ${theme.borderColors.divider}`,
    marginBottom: theme.spacing(3),
    marginTop: 22,
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
