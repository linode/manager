import * as React from 'react';
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';

const ImagesLanding = React.lazy(() => import('./ImagesLanding'));
const ImagesCreate = React.lazy(
  () => import('./ImagesCreate/ImagesCreateContainer')
);

type Props = RouteComponentProps<{}>;

class ImagesRoutes extends React.Component<Props> {
  render() {
    const {
      match: { path },
    } = this.props;

    return (
      <React.Suspense fallback={<SuspenseLoader />}>
        <Switch>
          <Route component={ImagesLanding} path={path} exact />
          <Route component={ImagesCreate} path={`${path}/create`} exact />
        </Switch>
      </React.Suspense>
    );
  }
}

export default withRouter(ImagesRoutes);

export { default as ImageSelect } from './ImageSelect';
