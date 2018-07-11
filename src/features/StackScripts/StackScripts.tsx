import * as React from 'react';
import { Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom';

import DefaultLoader from 'src/components/DefaultLoader';

const StackScriptsLanding = DefaultLoader({
  loader: () => import('./StackScriptsLanding'),
});

type Props = RouteComponentProps<{}>;

class NodeBalancers extends React.Component<Props> {
  render() {
    const { match: { path } } = this.props;

    return (
      <Switch>
        <Route component={StackScriptsLanding} path={path} exact />
      </Switch>
    );
  }
}

export default withRouter(NodeBalancers);
