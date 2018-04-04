import * as React from 'react';
import {
  matchPath,
  withRouter,
  Route,
  Switch,
  RouteComponentProps,
  Redirect,
} from 'react-router-dom';

import Typography from 'material-ui/Typography';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

import { RouteTab, genTab } from 'src/tabs';
import LinodeSummary from './LinodeSummary';

type Props = RouteComponentProps<{ linodeId?: number }>;

class LinodeDetail extends React.Component<Props> {
  handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    const { history } = this.props;
    const routeName = this.tabs[value].routeName;
    history.push(`${routeName}`);
  }

  tabs: RouteTab[] = [
    genTab('Summary', `${this.props.location.pathname}/summary`, LinodeSummary),
  ];

  render() {
    const { match: { path }, location } = this.props;
    const matches = (p: string) => Boolean(matchPath(p, { path: this.props.location.pathname }));

    return (
      <div>
        <Typography variant="headline">
          Linode Detail
        </Typography>
        <AppBar position="static" color="default">
          <Tabs
            value={this.tabs.findIndex(tab => matches(tab.routeName))}
            onChange={this.handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            {this.tabs.map(tab => <Tab key={tab.title} label={tab.title} />)}
          </Tabs>
        </AppBar>
        <Switch>
          {this.tabs.map(tab => tab.renderRoute(path))}
          <Route exact path={`${path}/`} render={() =>
            (<Redirect to={`${location.pathname}/summary`} />)} />
        </Switch>
      </div>
    );
  }
}

export default withRouter(LinodeDetail);
