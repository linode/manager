import { styled } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import React, { useEffect, useState } from 'react';

import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanel } from 'src/components/Tabs/TabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { Typography } from 'src/components/Typography';

import { Box } from '../Box';

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {header && (
            <Typography data-qa-tp-title variant="h2">
              {header}
            </Typography>
          )}
          {docsLink}
        </Box>
        {error && (
          <Notice spacingBottom={0} spacingTop={12} variant="error">
            {error}
          </Notice>
        )}
        {copy && <StyledTypography data-qa-tp-copy>{copy}</StyledTypography>}
        <StyledTabs index={tabIndex} onChange={tabChangeHandler}>
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
        </StyledTabs>
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
    marginTop: theme.spacing(1),
  },
}));

const StyledTabs = styled(Tabs, {
  label: 'StyledTabs',
})(() => ({
  position: 'relative',
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
