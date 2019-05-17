import * as React from 'react';
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';

import DefaultLoader from 'src/components/DefaultLoader';

const StackScriptsDetail = DefaultLoader({
  loader: () => import('./StackScriptsDetail')
});

const StackScriptsLanding = DefaultLoader({
  loader: () => import('./StackScriptsLanding')
});

const StackScriptCreate = DefaultLoader({
  loader: () => import('./StackScriptCreate')
});

const StackScriptUpdate = DefaultLoader({
  loader: () => import('./StackScriptUpdate')
});

type Props = RouteComponentProps<{}>;

class NodeBalancers extends React.Component<Props> {
  render() {
    const {
      match: { path }
    } = this.props;

    return (
      <Switch>
        <Route component={StackScriptsLanding} path={path} exact />
        <Route component={StackScriptCreate} path={`${path}/create`} exact />
        <Route
          component={StackScriptUpdate}
          path={`${path}/:stackScriptID/edit`}
          exact
        />
        <Route component={StackScriptsDetail} path={`${path}/:stackScriptId`} />
      </Switch>
    );
  }
}

export default withRouter(NodeBalancers);
