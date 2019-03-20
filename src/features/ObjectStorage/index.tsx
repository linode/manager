import * as React from 'react';
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';

import DefaultLoader from 'src/components/DefaultLoader';

const ObjectStorageLanding = DefaultLoader({
  loader: () => import('./ObjectStorageLanding')
});

type Props = RouteComponentProps<{}>;

class ObjectStorage extends React.Component<Props> {
  render() {
    const {
      match: { path }
    } = this.props;

    return (
      <Switch>
        <Route component={ObjectStorageLanding} path={path} exact />
      </Switch>
    );
  }
}

export default withRouter(ObjectStorage);
