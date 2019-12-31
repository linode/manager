import * as React from 'react';
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';

const KubernetesLanding = React.lazy(() => import('./KubernetesLanding'));

const ClusterCreate = React.lazy(() => import('./CreateCluster'));

const ClusterDetail = React.lazy(() => import('./KubernetesClusterDetail'));

type Props = RouteComponentProps<{}>;

const WrapWithSuspense = (_Component: React.ComponentType<any>) => {
  return (
    <React.Suspense fallback={<CircleProgress />}>
      {<_Component />}
    </React.Suspense>
  );
};

class Kubernetes extends React.Component<Props> {
  render() {
    const {
      match: { path }
    } = this.props;

    return (
      <Switch>
        <Route
          render={() => WrapWithSuspense(ClusterCreate)}
          exact
          path={`${path}/create`}
        />
        <Route
          component={(routeProps: RouteComponentProps<any>) => (
            <React.Suspense fallback={<CircleProgress />}>
              <ClusterDetail {...routeProps} />
            </React.Suspense>
          )}
          path={`${path}/clusters/:clusterID`}
        />
        <Route
          component={() => WrapWithSuspense(KubernetesLanding)}
          exact
          path={`${path}/clusters`}
        />
        <Redirect to={'/kubernetes/clusters'} />
      </Switch>
    );
  }
}

export default withRouter(Kubernetes);
