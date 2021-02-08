import * as React from 'react';
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';

const EntityTransfersLanding = React.lazy(() =>
  import('./EntityTransfersLanding/EntityTransfersLanding')
);
const EntityTransfersCreate = React.lazy(() =>
  import('./EntityTransfersCreate')
);

type Props = RouteComponentProps<{}>;

const EntityTransfers: React.FC<Props> = props => {
  const {
    match: { path }
  } = props;

  return (
    <Switch>
      <Route component={EntityTransfersCreate} path={`${path}/create`} />
      <Route component={EntityTransfersLanding} path={path} exact strict />
      <Redirect to={path} />
    </Switch>
  );
};

export default withRouter(EntityTransfers);
