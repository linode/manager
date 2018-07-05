import * as React from 'react';
import { matchPath, Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';;
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import Glish from './Glish';
import Weblish from './Weblish';

type ClassNames = 'tabs' | 'tabRoot';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  tabs: {
    backgroundColor: '#f4f4f4',
  },
  tabRoot: {
    minWidth: '50%',
  }
});

type CombinedProps = WithStyles<ClassNames> & RouteComponentProps<{}>;

class Lish extends React.Component<CombinedProps> {
  state = {};

  componentDidMount() {
    const webLishCss = import('' + '../../assets/weblish/weblish.css');
    const xtermCss = import('' + '../../assets/weblish/xterm.css');
    Promise.all([webLishCss, xtermCss]);
  }
  
  handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    const { history } = this.props;
    const routeName = this.tabs[value].routeName;
    history.push(`${routeName}`);
  }
  
  tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    { routeName: `${this.props.match.url}/weblish`, title: 'Weblish' },
    { routeName: `${this.props.match.url}/glish`, title: 'Glish' },
  ];

  matches = (p: string) => Boolean(matchPath(p, { path: this.props.location.pathname }));

  render() {
    const { classes, match: { path } } = this.props;

    return (
      <React.Fragment>
        <Tabs
          value={this.tabs.findIndex(tab => this.matches(tab.routeName))}
          onChange={this.handleTabChange}
          className={classes.tabs}
          indicatorColor="primary"
          textColor="primary"
          scrollable
          scrollButtons="off"
        >
          {this.tabs.map(tab =>
            <Tab 
              classes={{
                root: classes.tabRoot,
              }}
              key={tab.title}
              label={tab.title}
              data-qa-tab={tab.title}
            />)}
        </Tabs>
        <Switch>
          <Route exact path={`${path}/weblish`} component={Weblish} />
          <Route exact path={`${path}/glish`} component={Glish} />
        </Switch>
      </React.Fragment>
    );
  }
}


const styled = withStyles(styles, { withTheme: true });

export default withRouter(styled(Lish));