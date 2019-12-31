import * as React from 'react';
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';

const VolumesLanding = React.lazy(() => import('./VolumesLanding'));

const VolumeCreate = React.lazy(() => import('./VolumeCreate/VolumeCreate'));

type Props = RouteComponentProps<{}>;

class Volumes extends React.Component<Props> {
  render() {
    const {
      match: { path }
    } = this.props;

    return (
      <Switch>
        <React.Suspense fallback={<CircleProgress />}>
          <Route component={VolumesLanding} path={path} exact strict />
          <Route
            component={VolumeCreate}
            path={`${path}/create`}
            exact
            strict
          />
          <Redirect to={path} />
        </React.Suspense>
      </Switch>
    );
  }
}

export default withRouter(Volumes);
