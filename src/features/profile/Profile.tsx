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

import APITokens from './APITokens';
import OAuthClients from './OAuthClients';

type Props = RouteComponentProps<{ linodeId?: number }>;

type Tab = {
  title: string,
  routeName: string,
  renderRoute: (path: string) => React.ReactNode;
};

class Profile extends React.Component<Props> {
  genTab = (title: string, routeName: string, component: React.ComponentClass): Tab => {
    return {
      title,
      routeName,
      renderRoute: (path: string) =>
        <Route key={title} component={component} path={`${routeName}`} />,
    };
  }

  handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    const { history } = this.props;
    const routeName = this.tabs[value].routeName;
    history.push(`${routeName}`);
  }

  tabs: Tab[] = [
    this.genTab('API Tokens', `${this.props.match.path}/tokens`, APITokens),
    this.genTab('OAuth Clients', `${this.props.match.path}/clients`, OAuthClients),
  ];

  render() {
    const { match: { path } } = this.props;
    const matches = (p: string) => Boolean(matchPath(p, { path: this.props.location.pathname }));

    return (
      <div>
        <Typography variant="headline">
          My Profile
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
          <Route exact path={`${path}/`} render={() => (<Redirect to={`${path}/tokens`} />)} />
        </Switch>
      </div>
    );
  }
}

export default withRouter(Profile);
