import * as React from 'react';
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';

import DefaultLoader from 'src/components/DefaultLoader';

const KubernetesLanding = DefaultLoader({
  loader: () => import('./KubernetesLanding')
});

type Props = RouteComponentProps<{}>;

class Kubernetes extends React.Component<Props> {
  render() {
    const {
      match: { path }
    } = this.props;

    return (
      <Switch>
        <Route component={KubernetesLanding} path={path} exact />
      </Switch>
    );
  }
}

export default withRouter(Kubernetes);
