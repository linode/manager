import * as React from 'react';
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';

import DefaultLoader from 'src/components/DefaultLoader';

const LongviewLanding = DefaultLoader({
  loader: () => import('./LongviewLanding')
});

type Props = RouteComponentProps<{}>;

class Longview extends React.Component<Props> {
  render() {
    const {
      match: { path }
    } = this.props;

    return (
      <Switch>
        <Route component={LongviewLanding} path={path} exact />
      </Switch>
    );
  }
}

export default withRouter(Longview);
