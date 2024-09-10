import HelpOutline from '@mui/icons-material/HelpOutline';
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
import { Tooltip } from 'src/components/Tooltip';
import { Typography } from 'src/components/Typography';

import { Box } from '../Box';

export interface Tab {
  disabled?: boolean;
  render: (props: any) => JSX.Element | null;
  title: string;
}

interface TabbedPanelProps {
  bodyClass?: string;
  children?: React.ReactNode;
  copy?: string;
  docsLink?: JSX.Element;
  error?: JSX.Element | string;
  handleTabChange?: (index: number) => void;
  header: string;
  initTab?: number;
  innerClass?: string;
  noPadding?: boolean;
  rootClass?: string;
  sx?: SxProps;
  tabDisabledMessage?: string;
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

  const sxHelpIcon = {
    height: 20,
    m: 0.5,
    verticalAlign: 'sub',
    width: 20,
  };

  const tabChangeHandler = (index: number) => {
    setTabIndex(index);
    if (handleTabChange) {
      handleTabChange(index);
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
              <StyledTab
                disabled={tab.disabled}
                key={`tabs-${tab.title}-${idx}`}
              >
                {tab.title}
                {tab.disabled && props.tabDisabledMessage && (
                  <Tooltip title={props.tabDisabledMessage}>
                    <span>
                      <HelpOutline fontSize="small" sx={sxHelpIcon} />
                    </span>
                  </Tooltip>
                )}
              </StyledTab>
            ))}
          </StyledTabList>
          <TabPanels>
            {tabs.map((tab, idx) => (
              <TabPanel
                key={`tabs-panel-${tab.title}-${idx}`}
                data-qa-tp-tab={tab.title}
              >
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
