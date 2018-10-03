import * as React from 'react';

import AppBar from '@material-ui/core/AppBar';
import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';

import Notice from '../Notice';

type ClassNames = 'root'
  | 'inner'
  | 'copy'
  | 'tabs'
  | 'panelBody';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.color.white,
  },
  inner: {
    padding: theme.spacing.unit * 3,
  },
  copy: {
    fontSize: '0.875rem',
    marginTop: theme.spacing.unit,
  },
  tabs: {
    margin: `${theme.spacing.unit}px 0`,
  },
  panelBody: {
    padding: `${theme.spacing.unit * 2}px 0 0`,
  },
});

export interface Tab {
  title: string;
  render: (props: any) => JSX.Element | null;
}
interface Props {
  header: string;
  error?: string;
  copy?: string;
  rootClass?: string;
  tabs: Tab[];
  [index: string]: any;
  initTab?: number;
  shrinkTabContent?: string;
  handleTabChange?: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class TabbedPanel extends React.Component<CombinedProps> {
  state = { value: this.props.initTab || 0 };

  handleChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    if (this.props.handleTabChange) {
      this.props.handleTabChange();
    }
    this.setState({ value });
  }

  render() {
    const { classes, header, tabs, shrinkTabContent, copy, error, rootClass, ...rest } = this.props;
    const { value } = this.state;
    const render = tabs[value].render;

    return (
      <Paper className={`${classes.root} ${rootClass}`} data-qa-tp={header}>
        <div className={`${classes.inner}`}>
          {error && <Notice text={error} error />}
          <Typography role="header" variant="title" data-qa-tp-title>{header}</Typography>
          {copy && <Typography component="div" className={classes.copy}
            data-qa-tp-copy>{copy}</Typography>}
          <AppBar position="static" color="default">
            <Tabs
              value={value}
              onChange={this.handleChange}
              indicatorColor="primary"
              textColor="primary"
              className={`${classes.tabs}`}
            >
              {tabs.map((tab, idx) => <Tab key={idx} label={tab.title} data-qa-tab={tab.title} />)}
            </Tabs>
          </AppBar>
          <Typography component="div" className={`${classes.panelBody} ${shrinkTabContent}`}
            data-qa-tab-body>
            {render(rest)}
          </Typography>
        </div>
      </Paper>
    );
  }
}

export default withStyles(styles, { withTheme: true })(TabbedPanel) as React.ComponentType<Props>;
