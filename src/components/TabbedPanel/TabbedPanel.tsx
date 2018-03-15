import * as React from 'react';

import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import Typography from 'material-ui/Typography';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    backgroundColor: theme.palette.background.paper,
  },
});

interface Tab {
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
      <div className={classes.root}>
        <div>{header}</div>
        {copy && <div>{copy}</div>}
        <AppBar position="static" color="default">
          <Tabs
            value={value}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            scrollable
            scrollButtons="auto"
          >
          { tabs.map((tab, idx) => <Tab key={idx} label={tab.title} />) }
          </Tabs>
        </AppBar>
        <Typography component="div" style={{ padding: 8 * 3 }}>
            { render(rest) }
        </Typography>
      </div>
    );
  }
}

export default withStyles(styles)(TabbedPanel);
