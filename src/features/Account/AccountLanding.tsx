import * as React from 'react';
import {
  matchPath,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';
import AppBar from 'src/components/core/AppBar';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import TabLink from 'src/components/TabLink';

import DefaultLoader from 'src/components/DefaultLoader';

type Props = RouteComponentProps<{}>;

const GlobalSettings = DefaultLoader({
  loader: () => import('./GlobalSettings')
});

const Users = DefaultLoader({
  loader: () => import('src/features/Users')
});

const Billing = DefaultLoader({
  loader: () => import('src/features/Billing')
});

class AccountLanding extends React.Component<Props> {
  handleTabChange = (
    event: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    const { history } = this.props;
    const routeName = this.tabs[value].routeName;
    history.push(`${routeName}`);
  };

  tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    { title: 'Billing Info', routeName: `${this.props.match.url}/billing` },
    { title: 'Users', routeName: `${this.props.match.url}/users` },
    { title: 'Settings', routeName: `${this.props.match.url}/settings` }
  ];

  render() {
    const {
      match: { url }
    } = this.props;
    const matches = (p: string) => {
      return Boolean(matchPath(p, { path: this.props.location.pathname }));
    };

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Account Settings" />
        <Typography variant="h1" data-qa-profile-header>
          Account Settings
        </Typography>
        <AppBar position="static" color="default">
          <Tabs
            value={this.tabs.findIndex(tab => matches(tab.routeName))}
            onChange={this.handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="on"
          >
            {this.tabs.map(tab => (
              <Tab
                key={tab.title}
                data-qa-tab={tab.title}
                component={React.forwardRef((props, ref) => (
                  <TabLink
                    to={tab.routeName}
                    title={tab.title}
                    {...props}
                    ref={ref}
                  />
                ))}
              />
            ))}
          </Tabs>
        </AppBar>
        <Switch>
          <Route exact path={`${url}/billing`} component={Billing} />
          <Route exact path={`${url}/users`} component={Users} />
          <Route exact path={`${url}/settings`} component={GlobalSettings} />
          <Route exact path={`${url}`} component={Billing} />
        </Switch>
      </React.Fragment>
    );
  }
}

export default withRouter(AccountLanding);
