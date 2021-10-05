import * as React from 'react';
import { useDispatch } from 'react-redux';
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from 'react-router-dom';
import { compose } from 'recompose';
import NotFound from 'src/components/NotFound';
import SuspenseLoader from 'src/components/SuspenseLoader';
import useExtendedLinode from 'src/hooks/useExtendedLinode';
import {
  LinodeDetailContext,
  linodeDetailContextFactory as createLinodeDetailContext,
  LinodeDetailContextProvider,
} from './linodeDetailContext';
import LinodeDetailErrorBoundary from './LinodeDetailErrorBoundary';

const LinodesDetailHeader = React.lazy(() => import('./LinodesDetailHeader'));
const LinodesDetailNavigation = React.lazy(
  () => import('./LinodesDetailNavigation')
);
const CloneLanding = React.lazy(() => import('../CloneLanding'));

interface Props {
  linodeId: string;
}

type CombinedProps = Props & RouteComponentProps<{ linodeId: string }>;

const LinodeDetail: React.FC<CombinedProps> = (props) => {
  const {
    linodeId,
    match: { path, url },
  } = props;

  const dispatch = useDispatch();
  const linode = useExtendedLinode(+linodeId);

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

          <Route
            render={() => (
              <React.Fragment>
                <LinodesDetailHeader />
                <LinodesDetailNavigation />
                <Switch>
                  <Redirect from={`${url}/resize`} to={`${url}?resize=true`} />
                  <Redirect
                    from={`${url}/rebuild`}
                    to={`${url}?rebuild=true`}
                  />
                  <Redirect from={`${url}/rescue`} to={`${url}?rescue=true`} />
                  <Redirect
                    from={`${url}/migrate`}
                    to={`${url}?migrate=true`}
                  />
                  <Redirect
                    from={`${url}/upgrade`}
                    to={`${url}?upgrade=true`}
                  />
                </Switch>
              </React.Fragment>
            )}
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
