import * as React from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';

const VolumesLanding = React.lazy(() => import('./VolumesLanding'));
const VolumeCreate = React.lazy(() => import('./VolumeCreate/VolumeCreate'));

const Volumes = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route
        exact
        path={path}
        render={() => <VolumesLanding isVolumesLanding removeBreadCrumb />}
        strict
      />
      <Route component={VolumeCreate} exact path={`${path}/create`} strict />
      <Redirect to={path} />
    </Switch>
  );
};

export default Volumes;
