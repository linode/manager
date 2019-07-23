import * as React from 'react';
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';

import DefaultLoader from 'src/components/DefaultLoader';

const LinodesLanding = DefaultLoader({
  loader: () => import('./LinodesLanding')
});

const LinodesCreate = DefaultLoader({
  loader: () => import('./LinodesCreate/LinodeCreateContainer')
});

const LinodesDetail = DefaultLoader({
  loader: () => import('./LinodesDetail')
});

type Props = RouteComponentProps<{}>;

class LinodesRoutes extends React.Component<Props> {
  render() {
    const {
      match: { path }
    } = this.props;

    return (
      <Switch>
        <Route component={LinodesCreate} path={`${path}/create`} />
        <Route component={LinodesDetail} path={`${path}/:linodeId`} />
        <Route component={LinodesLanding} path={path} exact strict />
        <Redirect to={path} />
      </Switch>
    );
  }
}

export default withRouter(LinodesRoutes);
