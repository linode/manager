import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Route, Switch, useLocation } from 'react-router-dom';
import { compose } from 'recompose';
import SuspenseLoader from 'src/components/SuspenseLoader';
import LinodeDetailErrorBoundary from './LinodeDetailErrorBoundary';
import useExtendedLinode from 'src/hooks/useExtendedLinode';
import NotFound from 'src/components/NotFound';
import {
  LinodeDetailContext,
  linodeDetailContextFactory as createLinodeDetailContext,
  LinodeDetailContextProvider
} from './linodeDetailContext';

const CloneLanding = React.lazy(() => import('../CloneLanding'));
const LinodesDetailHeader = React.lazy(() => import('./LinodesDetailHeader'));
const LinodesDetailNavigation = React.lazy(() =>
  import('./LinodesDetailNavigation')
);
const MigrateLanding = React.lazy(() => import('../MigrateLanding'));

interface Props {
  linodeId: string;
}

type CombinedProps = Props;

const LinodeDetail: React.FC<CombinedProps> = props => {
  const { linodeId } = props;
  const dispatch = useDispatch();
  const linode = useExtendedLinode(+linodeId);
  const location = useLocation();

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
          <Route path={`${location.pathname}/clone`} component={CloneLanding} />
          <Route
            path={`${location.pathname}/migrate`}
            component={MigrateLanding}
          />
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
    </LinodeDetailContextProvider>
  );
};

const enhanced = compose<CombinedProps, Props>(LinodeDetailErrorBoundary);

export default enhanced(LinodeDetail);
