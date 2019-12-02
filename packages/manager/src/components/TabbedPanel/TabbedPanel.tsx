import * as classNames from 'classnames';
import React, { useState } from 'react';
import { compose } from 'recompose';
import AppBar from 'src/components/core/AppBar';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import Typography from 'src/components/core/Typography';
import { safeGetTabRender } from 'src/utilities/safeGetTabRender';
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
    },
    '[role="tabpanel"]:focus': {
      borderColor: 'orange',
      outline: '1px solid orange'
    }
  },
  copy: {
    fontSize: '0.875rem',
    marginTop: theme.spacing(1)
  },
  tabs: {
    margin: `${theme.spacing(1)}px 0`
  },
  panelBody: {
    padding: `${theme.spacing(2)}px 0 0`
  }
}));

const tabInterface: any = React.useRef<HTMLDivElement>(null);

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
  handleTabChange?: (value?: number) => void;
}

type CombinedProps = Props;

const TabbedPanel: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const {
    header,
    tabs,
    shrinkTabContent,
    copy,
    error,
    rootClass,
    innerClass,
    noPadding,
    ...rest
  } = props;

  const [value, setValue] = React.useState<number>(props.initTab || 0);

  // if this bombs the app shouldn't crash
  const render = safeGetTabRender(tabs, value);

  const handleChange = (
    event: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    if (props.handleTabChange) {
      props.handleTabChange(value);
    }
    setValue({ value });
  };

  const tabA11yProps = (index: number) => {
    return {
      id: `tab-${index}`,
      role: 'tab',
      'aria-controls': `tabpanel-${index}`
    };
  };

  const tabPanelA11yProps = (index: number) => {
    return {
      id: `tabpanel-${index}`,
      role: 'tabpanel',
      'aria-labelledby': `tab-${index}`,
      tabIndex: 0
    };
  };

  const handleTabToPanel = (
    e: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    const tabPanel = document.getElementById(`tabpanel-${value}`);

    if (e && tabPanel) {
      tabPanel.focus();
    }
  };

  // Need to find a way to only scope this to each tabbed panel component instead of capturing all tab interfaces on a page (ahem resize)
  const onKeyDown = (e: any, value: number) => {
    // Enable arrow navigation between tabs in the tab list
    let tabFocus = 0;
    const tabs = tabInterface.querySelectorAll('[role="tab"]');

    const tabSelector: HTMLElement = tabs[tabFocus];

    // If tab or enter, goes to associated tabpanel
    if (e.keyCode === 13 || e.keyCode === 9) {
      handleTabToPanel(e, value);
    } // Move right

    if (e.keyCode === 39 || e.keyCode === 37) {
      tabSelector.setAttribute('tabindex', '-1');
      if (e.keyCode === 39) {
        tabFocus++; // If we're at the end, go to the start
        // console.log('keyboard 39 ' + tabSelector);
        if (tabFocus >= tabs.length) {
          tabFocus = 0;
        } // Move left
      } else if (e.keyCode === 37) {
        tabFocus--; // If we're at the start, move to the end
        // console.log('keyboard 37 ' + tabSelector);
        if (tabFocus < 0) {
          tabFocus = tabs.length - 1;
        }
      }
      tabSelector.setAttribute('tabindex', '0');
      tabSelector.focus();
    }
  };

  return (
    <Paper className={`${classes.root} ${rootClass}`} data-qa-tp={header}>
      <div className={`${classes.inner} ${innerClass}`}>
        {error && <Notice text={error} error />}
        <Typography variant="h2" data-qa-tp-title>
          {header}
        </Typography>
        {copy && (
          <Typography component="div" className={classes.copy} data-qa-tp-copy>
            {copy}
          </Typography>
        )}
        <AppBar
          position="static"
          color="default"
          role="tablist"
          className="tablist-kayla"
          ref={tabInterface}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            className={`${classes.tabs}`}
            variant="scrollable"
            scrollButtons="on"
          >
            {tabs.map((tab, idx) => (
              <Tab
                key={idx}
                onKeyDown={(e: any) => onKeyDown(e, value)}
                label={tab.title}
                data-qa-tab={tab.title}
                {...tabA11yProps(idx)}
              />
            ))}
          </Tabs>
        </AppBar>
        <div
          className={classNames(
            {
              [classes.panelBody]: !noPadding
            },
            shrinkTabContent
          )}
          data-qa-tab-body
          {...tabPanelA11yProps(value)}
        >
          {render(rest)}
        </div>
      </div>
    </Paper>
  );
};

export default compose<CombinedProps, Props>(React.memo)(TabbedPanel);
