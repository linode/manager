import * as React from 'react';
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';

import DefaultLoader from 'src/components/DefaultLoader';

const DomainsLanding = DefaultLoader({
  loader: () => import('./DomainsLanding')
});

const DomainDetails = DefaultLoader({
  loader: () => import('./DomainDetail')
});

type Props = RouteComponentProps<{}>;

class DomainsRoutes extends React.Component<Props> {
  render() {
    const {
      match: { path }
    } = this.props;

    return (
      <Switch>
        <Route component={DomainDetails} path={`${path}/:domainId`} />
        <Route component={DomainsLanding} path={path} exact />
      </Switch>
    );
  }
}

export default withRouter(DomainsRoutes);
