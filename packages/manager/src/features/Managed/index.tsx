import * as React from 'react';
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';

const ManagedLanding = React.lazy(() => import('./ManagedLanding'));

type Props = RouteComponentProps<{}>;

class Managed extends React.Component<Props> {
  render() {
    const {
      match: { path }
    } = this.props;

    return (
      <Switch>
        <Route component={ManagedLanding} path={path} />
      </Switch>
    );
  }
}

export default withRouter(Managed);
