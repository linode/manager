import * as React from 'react';
import { useDispatch } from 'react-redux';
import {
  Redirect,
  Route,
  Switch,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';
import useExtendedLinode from 'src/hooks/useExtendedLinode';
import {
  LinodeDetailContext,
  linodeDetailContextFactory as createLinodeDetailContext,
  LinodeDetailContextProvider,
} from './linodeDetailContext';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import ErrorState from 'src/components/ErrorState';
import { CircleProgress } from 'src/components/CircleProgress';

const LinodesDetailHeader = React.lazy(
  () => import('./LinodesDetailHeader/LinodeDetailHeader')
);
const LinodesDetailNavigation = React.lazy(
  () => import('./LinodesDetailNavigation')
);
const CloneLanding = React.lazy(() => import('../CloneLanding'));

const LinodeDetail = () => {
  const { url, path } = useRouteMatch();
  const { linodeId } = useParams<{ linodeId: string }>();

  const id = Number(linodeId);

  const dispatch = useDispatch();
  const { data: linode, isLoading, error } = useLinodeQuery(id);

  // We can remove this when we remove the context below
  const extendedLinode = useExtendedLinode(id);

  if (error) {
    return <ErrorState errorText={error?.[0].reason} />;
  }

  if (isLoading || !linode || !extendedLinode) {
    return <CircleProgress />;
  }

  // We will delete this as soon as we react query all consumers of this context
  const ctx: LinodeDetailContext = createLinodeDetailContext(
    extendedLinode,
    dispatch
  );

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

export default LinodeDetail;
