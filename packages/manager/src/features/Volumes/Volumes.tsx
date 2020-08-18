import * as React from 'react';
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';
import useFlags from 'src/hooks/useFlags';

const VolumesLanding = React.lazy(() => import('./VolumesLanding'));
const VolumesLanding_CMR = React.lazy(() => import('./VolumesLanding_CMR'));

const VolumeCreate = React.lazy(() => import('./VolumeCreate/VolumeCreate'));

type Props = RouteComponentProps<{}>;

const Volumes: React.FC<Props> = props => {
  const {
    match: { path }
  } = props;

  const flags = useFlags();

  return (
    <Switch>
      <Route
        render={routeProps =>
          flags.cmr ? (
            <VolumesLanding_CMR
              isVolumesLanding
              removeBreadCrumb
              {...routeProps}
            />
          ) : (
            <VolumesLanding isVolumesLanding {...routeProps} />
          )
        }
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
