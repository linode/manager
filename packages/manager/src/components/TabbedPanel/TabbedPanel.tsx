import * as classNames from 'classnames';
import * as React from 'react';
import AppBar from 'src/components/core/AppBar';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import Typography from 'src/components/core/Typography';
import { safeGetTabRender } from 'src/utilities/safeGetTabRender';
import Notice from '../Notice';

type ClassNames = 'root' | 'inner' | 'copy' | 'tabs' | 'panelBody';

const styles = (theme: Theme) =>
  createStyles({
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
  });

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

type CombinedProps = Props & WithStyles<ClassNames>;

class TabbedPanel extends React.Component<CombinedProps> {
  state = { value: this.props.initTab || 0 };

  handleChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    if (this.props.handleTabChange) {
      this.props.handleTabChange(value);
    }
    this.setState({ value });
  };

  handleTabToPanel = (e: React.ChangeEvent<HTMLDivElement>, value: number) => {
    const tabPanel = document.getElementById(`tabpanel-${value}`);

    if (e && tabPanel) {
      tabPanel.focus();
    }
  };

  // Need to find a way to only scope this to each tabbed panel component instead of capturing all tab interfaces on a page (ahem resize)
  onKeyDown = (e: any, value: number) => {
    // Enable arrow navigation between tabs in the tab list
    let tabFocus = 0;
    const tabs: any = document.querySelectorAll('[role="tab"]');

    // If tab or enter, goes to associated tabpanel
    if (e.keyCode === 13 || e.keyCode === 9) {
      this.handleTabToPanel(e, value);
    }

    // TODO get this to work per component
    if (e.keyCode === 39 || e.keyCode === 37) {
      tabs[tabFocus].setAttribute('tabindex', '-1');
      if (e.keyCode === 39) {
        tabFocus++;
        // If we're at the end, go to the start
        if (tabFocus >= tabs.length) {
          tabFocus = 0;
        }
        // Move left
      } else if (e.keyCode === 37) {
        tabFocus--;
        // If we're at the start, move to the end
        if (tabFocus < 0) {
          tabFocus = tabs.length - 1;
        }
      }

      tabs[tabFocus].setAttribute('tabindex', '0');
      tabs[tabFocus].focus();
    }

    // TODO
    // If shift + tab, traverses back to tabs
    // if (e.shiftKey && e.keyCode === 9 && tab) {
    //   tab.setAttribute('tabindex', '0');
    //   tab.focus();
    // }
  };

  tabA11yProps(index: number) {
    return {
      id: `tab-${index}`,
      role: 'tab',
      'aria-controls': `tabpanel-${index}`
    };
  }

  tabPanelA11yProps(index: number) {
    return {
      id: `tabpanel-${index}`,
      role: 'tabpanel',
      'aria-labelledby': `tab-${index}`,
      tabIndex: 0
    };
  }

  render() {
    const {
      classes,
      header,
      tabs,
      shrinkTabContent,
      copy,
      error,
      rootClass,
      innerClass,
      noPadding,
      ...rest
    } = this.props;
    const { value } = this.state;
    // if this bombs the app shouldn't crash
    const render = safeGetTabRender(tabs, value);

    return (
      <Paper className={`${classes.root} ${rootClass}`} data-qa-tp={header}>
        <div className={`${classes.inner} ${innerClass}`}>
          {error && <Notice text={error} error />}
          <Typography variant="h2" data-qa-tp-title>
            {header}
          </Typography>
          {copy && (
            <Typography
              component="div"
              className={classes.copy}
              data-qa-tp-copy
            >
              {copy}
            </Typography>
          )}
          <AppBar
            position="static"
            color="default"
            onKeyDown={(e: any) => this.onKeyDown(e, value)}
            role="tablist"
            className="tablist-kayla"
          >
            <Tabs
              value={value}
              onChange={this.handleChange}
              indicatorColor="primary"
              textColor="primary"
              className={`${classes.tabs}`}
              variant="scrollable"
              scrollButtons="on"
            >
              {tabs.map((tab, idx) => (
                <Tab
                  key={idx}
                  label={tab.title}
                  data-qa-tab={tab.title}
                  {...this.tabA11yProps(idx)}
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
            {...this.tabPanelA11yProps(value)}
          >
            {render(rest)}
          </div>
        </div>
      </Paper>
    );
  }
}

export default withStyles(styles)(TabbedPanel) as React.ComponentType<Props>;
