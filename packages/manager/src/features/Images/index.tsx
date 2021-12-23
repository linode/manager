import * as React from 'react';
import {
  Redirect,
  Route,
  Switch,
  useRouteMatch,
  withRouter,
} from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';
import useAccountManagement from 'src/hooks/useAccountManagement';
import useFlags from 'src/hooks/useFlags';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';

const ImagesLanding = React.lazy(() => import('./ImagesLanding'));
const ImageCreate = React.lazy(
  () => import('./ImagesCreate/ImageCreateContainer')
);

export const ImagesRoutes: React.FC = () => {
  const flags = useFlags();
  const { account } = useAccountManagement();
  const { path } = useRouteMatch();

  const machineImagesEnabled = isFeatureEnabled(
    'Machine Images',
    Boolean(flags.machineImages),
    account?.capabilities ?? []
  );

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        {machineImagesEnabled ? (
          <Route component={ImageCreate} path={`${path}/create`} />
        ) : null}
        <Route component={ImagesLanding} path={path} exact strict />
        <Redirect to={path} />
      </Switch>
    </React.Suspense>
  );
};

export default withRouter(ImagesRoutes);

export { default as ImageSelect } from './ImageSelect';
