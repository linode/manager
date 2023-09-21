import * as React from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';

const VolumesLanding = React.lazy(() => import('./VolumesLanding'));
const VolumeCreate = React.lazy(
  () => import('./VolumeCreate/CreateVolumeForm')
);

const Volumes = () => {
  const { path } = useRouteMatch();

  return (
    <>
      <ProductInformationBanner bannerLocation="Volumes" />
      <Switch>
        <Route component={VolumesLanding} exact path={path} strict />
        <Route component={VolumeCreate} exact path={`${path}/create`} strict />
        <Redirect to={path} />
      </Switch>
    </>
  );
};

export default Volumes;
