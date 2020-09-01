import * as React from 'react';
import { useDispatch } from 'react-redux';
import {
  Route,
  Switch,
  RouteComponentProps,
  withRouter
} from 'react-router-dom';
import { compose } from 'recompose';
import SuspenseLoader from 'src/components/SuspenseLoader';
import LinodeDetailErrorBoundary from './LinodeDetailErrorBoundary';
import useExtendedLinode from 'src/hooks/useExtendedLinode';
import useFlags from 'src/hooks/useFlags';
import NotFound from 'src/components/NotFound';
import {
  LinodeDetailContext,
  linodeDetailContextFactory as createLinodeDetailContext,
  LinodeDetailContextProvider
} from './linodeDetailContext';

const CloneLanding = React.lazy(() => import('../CloneLanding'));
const LinodesDetailHeader = React.lazy(() => import('./LinodesDetailHeader'));
const LinodesDetailHeader_CMR = React.lazy(() =>
  import('./LinodesDetailHeader/LinodeDetailHeader_CMR')
);
const LinodesDetailNavigation = React.lazy(() =>
  import('./LinodesDetailNavigation')
);
const LinodesDetailNavigation_CMR = React.lazy(() =>
  import('./LinodesDetailNavigation_CMR')
);
const LinodesDashboardNavigation = React.lazy(() =>
  import('./LinodesDashboardNavigation')
);
const MigrateLanding = React.lazy(() => import('../MigrateLanding'));

interface Props {
  linodeId: string;
  isDashboard: boolean;
}

type CombinedProps = Props & RouteComponentProps<{ linodeId: string }>;

const LinodeDetail: React.FC<CombinedProps> = props => {
  const {
    isDashboard,
    linodeId,
    match: { path }
  } = props;
  const dispatch = useDispatch();
  const linode = useExtendedLinode(+linodeId);
  const flags = useFlags();

  if (!linode) {
    return <NotFound />;
  }

  const ctx: LinodeDetailContext = createLinodeDetailContext(linode, dispatch);

  return (
    <LinodeDetailContextProvider value={ctx}>
      <React.Suspense fallback={<SuspenseLoader />}>
        <Switch>
          {/*
          Currently, the "Clone Configs and Disks" feature exists OUTSIDE of LinodeDetail.
          Or... at least it appears that way to the user. We would like it to live WITHIN
          LinodeDetail, though, because we'd like to use the same context, so we don't
          have to reload all the configs, disks, etc. once we get to the CloneLanding page.
          */}
          <Route path={`${path}/clone`} component={CloneLanding} />
          {/* With CMR, the Migrate screen no longer has its own route, so some
          conditional rendering is required here. */}
          <Route
            path={`${path}/migrate`}
            render={() => {
              return flags.cmr ? (
                <React.Fragment>
                  <LinodesDetailHeader_CMR />
                  <LinodesDetailNavigation_CMR />
                </React.Fragment>
              ) : (
                <MigrateLanding />
              );
            }}
          />
          <Route
            render={() =>
              flags.cmr ? (
                // We have separate routing for the version
                // rendered on the dashboard, to prevent the url
                // from changing when the active tab is changed.
                isDashboard ? (
                  // For single linode view
                  <React.Fragment>
                    <LinodesDetailHeader_CMR />
                    <LinodesDashboardNavigation />
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <LinodesDetailHeader_CMR />
                    <LinodesDetailNavigation_CMR />
                  </React.Fragment>
                )
              ) : (
                <React.Fragment>
                  <LinodesDetailHeader />
                  <LinodesDetailNavigation />
                </React.Fragment>
              )
            }
          />
        </Switch>
      </React.Suspense>
    </LinodeDetailContextProvider>
  );
};

const enhanced = compose<CombinedProps, Props>(
  withRouter,
  LinodeDetailErrorBoundary
);

export default enhanced(LinodeDetail);
