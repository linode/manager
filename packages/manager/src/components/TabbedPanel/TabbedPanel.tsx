import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import { Notice } from 'src/components/Notice/Notice';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import { SafeTabPanel } from '../SafeTabPanel/SafeTabPanel';

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

export const TabbedPanel = React.memo((props: TabbedPanelProps) => {
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

  const [tabIndex, setTabIndex] = useState<number>(initTab ?? 0);

  const tabChangeHandler = (index: number) => {
    setTabIndex(index);
    if (handleTabChange) {
      handleTabChange();
    }
  };

  useEffect(() => {
    if (tabIndex !== initTab && initTab !== undefined) {
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
          onChange={(_, i) => tabChangeHandler(i)}
          value={tabIndex}
          sx={{ position: 'relative' }}
        >
          {tabs.map((tab, idx) => (
            <Tab key={`tabs-${tab.title}-${idx}`} label={tab.title} />
          ))}
        </Tabs>
        {tabs.map((tab, idx) => (
          <SafeTabPanel
            key={`tabs-panel-${tab.title}-${idx}`}
            index={idx}
            value={tabIndex}
          >
            {tab.render(rest.children)}
          </SafeTabPanel>
        ))}
      </div>
    </Paper>
  );
});

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  marginTop: theme.spacing(1),
}));
