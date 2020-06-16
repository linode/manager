import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { compose } from 'recompose';
import SuspenseLoader from 'src/components/SuspenseLoader';
import LinodeDetailErrorBoundary from './LinodeDetailErrorBoundary';
import reloadableWithRouter from './reloadableWithRouter';
import { useLinodes } from 'src/hooks/useLinodes';

const CloneLanding = React.lazy(() => import('../CloneLanding'));
const LinodesDetailHeader = React.lazy(() => import('./LinodesDetailHeader'));
const LinodesDetailNavigation = React.lazy(() =>
  import('./LinodesDetailNavigation')
);
const MigrateLanding = React.lazy(() => import('../MigrateLanding'));

interface Props {
  linodeId: string;
}

type RouteProps = RouteComponentProps<MatchProps>;

type CombinedProps = Props;

const LinodeDetail: React.FC<CombinedProps> = props => {
  const { linodeId } = props;

  const { linodes } = useLinodes();

  const linode = linodes.itemsById[linodeId];

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        {/*
          Currently, the "Clone Configs and Disks" feature exists OUTSIDE of LinodeDetail.
          Or... at least it appears that way to the user. We would like it to live WITHIN
          LinodeDetail, though, because we'd like to use the same context, so we don't
          have to reload all the configs, disks, etc. once we get to the CloneLanding page.
          */}
        <Route path={`${path}/clone`} component={CloneLanding} />
        <Route path={`${path}/migrate`} component={MigrateLanding} />
        <Route
          render={() => (
            <React.Fragment>
              <LinodesDetailHeader />
              <LinodesDetailNavigation />
            </React.Fragment>
          )}
        />
      </Switch>
    </React.Suspense>
  );
};

const reloadable = reloadableWithRouter<CombinedProps, MatchProps>(
  (routePropsOld, routePropsNew) => {
    return (
      routePropsOld.match.params.linodeId !==
      routePropsNew.match.params.linodeId
    );
  }
);

const enhanced = compose<CombinedProps, Props>(
  reloadable,
  LinodeDetailErrorBoundary
);

export default enhanced(LinodeDetail);
