import * as React from 'react';
import {
  withRouter,
  Route,
  Switch,
  RouteComponentProps,
  Redirect,
} from 'react-router-dom';
import { Location } from 'history';
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
      renderRoute: (path: string) => <Route component={component} path={`${path}/${routeName}`} />,
    };
  }

  handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    const { history, match: { path } } = this.props;
    const routeName = this.tabs[value].routeName;
    history.push(`${path}/${routeName}`);
  }

  tabMatches = (location: Location, tab: Tab): boolean => {
    const locationTail = location.pathname.split('/').pop();
    return locationTail === tab.routeName;
  }

  tabs: Tab[] = [
    this.genTab('API Tokens', 'tokens', APITokens),
    this.genTab('OAuth Clients', 'clients', OAuthClients),
  ];

  render() {
    const { match: { path }, location } = this.props;

    return (
      <div>
        <Typography variant="headline">
          My Profile
        </Typography>
        <AppBar position="static" color="default">
          <Tabs
            value={this.tabs.findIndex(tab => this.tabMatches(location, tab))}
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
