import * as React from 'react';
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';

const ManagedLanding = React.lazy(() => import('./ManagedLanding'));

type Props = RouteComponentProps<{}>;

class Managed extends React.Component<Props> {
  render() {
    const {
      match: { path },
    } = this.props;

    return (
      <React.Suspense fallback={<SuspenseLoader />}>
        <Switch>
          <Route component={ManagedLanding} path={path} />
        </Switch>
      </React.Suspense>
    );
  }
}

export default withRouter(Managed);
