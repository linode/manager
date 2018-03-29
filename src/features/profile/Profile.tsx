import * as React from 'react';
import {
  withRouter,
  Route,
  Switch,
  RouteComponentProps,
  Redirect,
} from 'react-router-dom';
import Typography from 'material-ui/Typography';

import APITokens from './APITokens';
import OAuthClients from './OAuthClients';

type Props = RouteComponentProps<{ linodeId?: number }>;

class LinodesRoutes extends React.Component<Props> {
  render() {
    const { match: { path } } = this.props;

    return (
      <div>
        <Typography variant="display1">
          My Profile
        </Typography>
        <Switch>
          <Route component={APITokens} path={`${path}/tokens`}/>
          <Route component={OAuthClients} path={`${path}/clients`} />
          <Route exact path={`${path}/`} render={() => (<Redirect to={`${path}/tokens`} />)} />
        </Switch>
      </div>
    );
  }
}

export default withRouter(LinodesRoutes);
