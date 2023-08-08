import * as React from 'react';
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from 'react-router-dom';

import { SuspenseLoader } from 'src/components/SuspenseLoader';

const ImagesLanding = React.lazy(() => import('./ImagesLanding'));
const ImageCreate = React.lazy(
  () => import('./ImagesCreate/ImageCreateContainer')
);

type Props = RouteComponentProps<{}>;

export const ImagesRoutes: React.FC<Props> = (props) => {
  const {
    match: { path },
  } = props;

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={ImagesLanding} exact path={path} />
        <Route component={ImageCreate} path={`${path}/create`} />
        <Redirect to="/images" />
      </Switch>
    </React.Suspense>
  );
};

export default withRouter(ImagesRoutes);

export { default as ImageSelect } from './ImageSelect';
