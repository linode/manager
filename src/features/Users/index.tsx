import * as React from 'react';
import { Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom';

import UserDetail from './UserDetail';
import UsersLanding from './UsersLanding';

type Props = RouteComponentProps<{}>;

class UserRoutes extends React.Component<Props> {
  render() {
    const { match: { path } } = this.props;

    return (
      <Switch>
        <Route path={`${path}/:username`} component={UserDetail} />
        <Route path={path} exact component={UsersLanding} />
      </Switch>
    );
  }
}

export default withRouter(UserRoutes);
