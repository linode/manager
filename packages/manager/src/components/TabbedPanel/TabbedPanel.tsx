import { Box, Notice, Paper, Tooltip, Typography } from '@linode/ui';
import HelpOutline from '@mui/icons-material/HelpOutline';
import { styled } from '@mui/material/styles';
import React, { type JSX, useEffect, useState } from 'react';

import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanel } from 'src/components/Tabs/TabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';

import type { SxProps, Theme } from '@mui/material/styles';

export interface Tab {
  disabled?: boolean;
  disabledMessage?: string;
  render: (props: any) => JSX.Element | null;
  title: string;
}

interface TabbedPanelProps {
  bodyClass?: string;
  children?: React.ReactNode;
  copy?: string;
  docsLink?: JSX.Element;
  error?: JSX.Element | string;
  flow?: 'database' | 'kubernetes' | 'linode';
  handleTabChange?: (index: number) => void;
  header: string;
  initTab?: number;
  innerClass?: string;
  noPadding?: boolean;
  notice?: JSX.Element;
  rootClass?: string;
  sx?: SxProps<Theme>;
  tabs: Tab[];
  value?: number;
}

const TabbedPanel = React.memo((props: TabbedPanelProps) => {
  const {
    copy,
    docsLink,
    error,
    flow,
    handleTabChange,
    header,
    initTab,
    innerClass,
    notice,
    rootClass,
    sx,
    tabs,
    ...rest
  } = props;

  const [tabIndex, setTabIndex] = useState<number | undefined>(initTab);

  const tabChangeHandler = (index: number) => {
    setTabIndex(index);
    if (handleTabChange) {
      handleTabChange(index);
    }
  };

  useEffect(() => {
    if (tabIndex === undefined && initTab !== undefined) {
      setTabIndex(initTab);
    }
    // PR 176: ensure correct selected tab index when switching between postgres/mysql and valkey engine
    if (flow === 'database' && tabs.length === 2) {
      setTabIndex(0);
    }
  }, [initTab, tabs]);

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
        {notice}
        <StyledTabs index={tabIndex} onChange={tabChangeHandler}>
          <StyledTabList>
            {tabs.map((tab, idx) => (
              <>
                <StyledTab
                  data-pendo-id={tab.title}
                  disabled={tab.disabled}
                  key={`tabs-${tab.title}-${idx}`}
                >
                  {tab.title}
                </StyledTab>
                {tab.disabled && tab.disabledMessage && (
                  <Tooltip tabIndex={0} title={tab.disabledMessage}>
                    <Box
                      sx={(theme) => ({
                        marginLeft: `-${theme.spacingFunction(12)}`,
                        marginTop: theme.spacingFunction(10),
                      })}
                    >
                      <HelpOutline
                        fontSize="small"
                        sx={(theme) => ({
                          height: 20,
                          m: 0.5,
                          width: 20,
                          color: theme.tokens.component.Tab.Disabled.Icon,
                          '&:hover': {
                            color: theme.tokens.component.Tab.Hover.Icon,
                            cursor: 'pointer',
                          },
                        })}
                      />
                    </Box>
                  </Tooltip>
                )}
              </>
            ))}
          </StyledTabList>
          <TabPanels>
            {tabs.map((tab, idx) => (
              <TabPanel
                data-qa-tp-tab={tab.title}
                key={`tabs-panel-${tab.title}-${idx}`}
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
