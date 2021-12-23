import * as React from 'react';
import {
  Redirect,
  Route,
  Switch,
  useRouteMatch,
  withRouter,
} from 'react-router-dom';

const VolumesLanding = React.lazy(() => import('./VolumesLanding'));
const VolumeCreate = React.lazy(() => import('./VolumeCreate/VolumeCreate'));

const Volumes: React.FC = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route component={VolumeCreate} path={`${path}/create`} exact strict />
      <Route
        render={(routeProps) => (
          <VolumesLanding isVolumesLanding removeBreadCrumb {...routeProps} />
        )}
        path={path}
        exact
        strict
      />
      <Redirect to={path} />
    </Switch>
  );
};

export default withRouter(Volumes);
