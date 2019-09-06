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
      width: `calc(100% + ${theme.spacing(1)}px)`,
      backgroundColor: theme.color.white,
      [theme.breakpoints.up('sm')]: {
        width: `calc(100% + ${theme.spacing(2)}px)`
      }
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
          <AppBar position="static" color="default">
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
                <Tab key={idx} label={tab.title} data-qa-tab={tab.title} />
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
          >
            {render(rest)}
          </div>
        </div>
      </Paper>
    );
  }
}

export default withStyles(styles)(TabbedPanel) as React.ComponentType<Props>;
