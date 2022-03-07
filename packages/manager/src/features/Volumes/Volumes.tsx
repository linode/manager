import * as React from 'react';
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from 'react-router-dom';

const VolumesLanding = React.lazy(() => import('./VolumesLanding'));
const VolumeCreate = React.lazy(() => import('./VolumeCreate/VolumeCreate'));

type Props = RouteComponentProps<{}>;

const Volumes: React.FC<Props> = (props) => {
  const {
    match: { path },
  } = props;

  return (
    <Switch>
      <Route
        render={(routeProps) => (
          <VolumesLanding isVolumesLanding removeBreadCrumb {...routeProps} />
        )}
        path={path}
        exact
        strict
      />
      <Route component={VolumeCreate} path={`${path}/create`} exact strict />
      <Redirect to={path} />
    </Switch>
  );
};

export default withRouter(Volumes);
