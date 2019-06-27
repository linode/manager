import * as React from 'react';
import {
  Redirect,
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
        <Route component={DomainDetails} path={`${path}/:domainId`} exact />
        <Route component={DomainsLanding} path={path} exact />
        <Redirect to={`${path}`} />
      </Switch>
    );
  }
}

export default withRouter(DomainsRoutes);
