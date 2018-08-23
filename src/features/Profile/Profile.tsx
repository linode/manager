import * as React from 'react';
import { matchPath, Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import APITokens from './APITokens';
import AuthenticationSettings from './AuthenticationSettings';
import DisplaySettings from './DisplaySettings';
import LishSettings from './LishSettings';
import OAuthClients from './OAuthClients';
import Referrals from './Referrals';
import Settings from './Settings';

type Props = RouteComponentProps<{}>;

class Profile extends React.Component<Props> {
  handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    const { history } = this.props;
    const routeName = this.tabs[value].routeName;
    history.push(`${routeName}`);
  }

  tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    { title: 'Display', routeName: `${this.props.match.url}/display` },
    { title: 'Password & Authentication', routeName: `${this.props.match.url}/auth` },
    { title: 'Settings', routeName: `${this.props.match.url}/settings` },
    { title: 'API Tokens', routeName: `${this.props.match.url}/tokens` },
    { title: 'OAuth Clients', routeName: `${this.props.match.url}/clients` },
    { title: 'LISH', routeName: `${this.props.match.url}/lish` },
    { title: 'Referrals', routeName: `${this.props.match.url}/referrals` },
  ];

  render() {
    const { match: { url } } = this.props;
    const matches = (p: string) => {
      return Boolean(matchPath(p, { path: this.props.location.pathname }));
    };

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="My Profile" />
        <Typography role="header" variant="headline" data-qa-profile-header>
          My Profile
        </Typography>
        <AppBar position="static" color="default">
          <Tabs
            value={this.tabs.findIndex(tab => matches(tab.routeName))}
            onChange={this.handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            {this.tabs
              .map(tab => <Tab key={tab.title} label={tab.title} data-qa-tab={tab.title}
            />)}
          </Tabs>
        </AppBar>
        <Switch>
          <Route exact path={`${url}/settings`} component={Settings} />
          <Route exact path={`${url}/auth`} component={AuthenticationSettings} />
          <Route exact path={`${url}/tokens`} component={APITokens} />
          <Route exact path={`${url}/clients`} component={OAuthClients} />
          <Route exact path={`${url}/lish`} component={LishSettings} />
          <Route exact path={`${url}/referrals`} component={Referrals} />
          <Route path={`${url}`} component={DisplaySettings} />
        </Switch>
      </React.Fragment>
    );
  }
}

export default withRouter(Profile);
