import * as React from 'react';

import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';

type ClassNames = 'root'
| 'inner'
| 'copy'
| 'tabs'
| 'panelBody';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    backgroundColor: theme.palette.background.paper,
  },
  inner: {
    padding: theme.spacing.unit * 3,
  },
  copy: {
    color: '#606469',
    fontSize: '0.875rem',
    marginTop: theme.spacing.unit,
  },
  tabs: {
    margin: `${theme.spacing.unit}px 0`,
  },
  panelBody: {
    padding: `${theme.spacing.unit * 3}px 0 0`,
  },
});

export interface Tab {
  title: string;
  render: (props: any) => JSX.Element;
}
interface Props {
  header: string;
  copy?: string;
  tabs: Tab[];
  [index: string]: any;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class TabbedPanel extends React.Component<CombinedProps> {
  state = { value: 0 };

  handleChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    this.setState({ value });
  }

  render() {
    const { classes, header, tabs, copy, ...rest } = this.props;
    const { value } = this.state;
    const render = tabs[value].render;

    return (
      <Paper className={classes.root}>
        <div className={classes.inner}>
          <Typography variant="title">{header}</Typography>
          {copy && <Typography component="div" className={classes.copy}>{copy}</Typography>}
          <AppBar position="static" color="default">
            <Tabs
              value={value}
              onChange={this.handleChange}
              indicatorColor="primary"
              textColor="primary"
              className={classes.tabs}
            >
            { tabs.map((tab, idx) => <Tab key={idx} label={tab.title} />) }
            </Tabs>
          </AppBar>
          <Typography component="div" className={classes.panelBody}>
              { render(rest) }
          </Typography>
        </div>
      </Paper>
    );
  }
}

export default withStyles(styles)(TabbedPanel);
