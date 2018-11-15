import * as React from 'react';
import { matchPath, Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Billing from 'src/features/Billing';
import Users from 'src/features/Users';

import GlobalSettings from './GlobalSettings';

type Props = RouteComponentProps<{}>;

class AccountLanding extends React.Component<Props> {
  handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    const { history } = this.props;
    const routeName = this.tabs[value].routeName;
    history.push(`${routeName}`);
  }

  tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    { title: 'Billing Info', routeName: `${this.props.match.url}/billing` },
    { title: 'Users', routeName: `${this.props.match.url}/users` },
    { title: 'Global Settings', routeName: `${this.props.match.url}/settings` },
  ];

  render() {
    const { match: { url } } = this.props;
    const matches = (p: string) => {
      return Boolean(matchPath(p, { path: this.props.location.pathname }));
    };

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Account Settings" />
        <Typography role="header" variant="headline" data-qa-profile-header>
          Account Settings
        </Typography>
        <AppBar position="static" color="default">
          <Tabs
            value={this.tabs.findIndex(tab => matches(tab.routeName))}
            onChange={this.handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            scrollable
            scrollButtons="on"
          >
            {this.tabs
              .map(tab => <Tab key={tab.title} label={tab.title} data-qa-tab={tab.title}
            />)}
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
