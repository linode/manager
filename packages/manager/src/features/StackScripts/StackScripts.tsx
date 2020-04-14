import * as React from 'react';
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';

const StackScriptsDetail = React.lazy(() => import('./StackScriptsDetail'));
const StackScriptsLanding = React.lazy(() => import('./StackScriptsLanding'));
const StackScriptCreate = React.lazy(() => import('./StackScriptCreate'));
const StackScriptUpdate = React.lazy(() => import('./StackScriptUpdate'));

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
        <Route
          component={StackScriptsDetail}
          path={`${path}/:stackScriptId`}
          exact
        />
        <Redirect to={`${path}`} />
      </Switch>
    );
  }
}

export default withRouter(NodeBalancers);
