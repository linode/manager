import * as React from 'react';
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';

import DefaultLoader from 'src/components/DefaultLoader';

const ImagesLanding = DefaultLoader({
  loader: () => import('./ImagesLanding')
});

type Props = RouteComponentProps<{}>;

class ImagesRoutes extends React.Component<Props> {
  render() {
    const {
      match: { path }
    } = this.props;

    return (
      <Switch>
        <Route component={ImagesLanding} path={path} exact />
      </Switch>
    );
  }
}

export default withRouter(ImagesRoutes);

export { default as ImageSelect } from './ImageSelect';
