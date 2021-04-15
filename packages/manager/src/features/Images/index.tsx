import * as React from 'react';
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
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

type Props = RouteComponentProps<{}>;

export const ImagesRoutes: React.FC<Props> = (props) => {
  const {
    match: { path },
  } = props;

  const flags = useFlags();
  const { account } = useAccountManagement();

  const machineImagesEnabled = isFeatureEnabled(
    'Machine Images',
    Boolean(flags.machineImages),
    account.data?.capabilities ?? []
  );

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={ImagesLanding} path={path} exact />
        {machineImagesEnabled ? (
          <Route component={ImageCreate} path={`${path}/create`} />
        ) : null}
        <Redirect to="/images" />
      </Switch>
    </React.Suspense>
  );
};

export default withRouter(ImagesRoutes);

export { default as ImageSelect } from './ImageSelect';
