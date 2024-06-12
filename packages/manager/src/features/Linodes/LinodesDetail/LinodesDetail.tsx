import * as React from 'react';
import {
  Redirect,
  Route,
  Switch,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

const LinodesDetailHeader = React.lazy(
  () => import('./LinodesDetailHeader/LinodeDetailHeader')
);
const LinodesDetailNavigation = React.lazy(
  () => import('./LinodesDetailNavigation')
);
const CloneLanding = React.lazy(() => import('../CloneLanding/CloneLanding'));

const LinodeDetail = () => {
  const { path, url } = useRouteMatch();
  const { linodeId } = useParams<{ linodeId: string }>();
  const location = useLocation();

  const queryParams = getQueryParamsFromQueryString(location.search);

  const id = Number(linodeId);

  const { data: linode, error, isLoading } = useLinodeQuery(id);

  if (error) {
    return <ErrorState errorText={error?.[0].reason} />;
  }

  if (isLoading || !linode) {
    return <CircleProgress />;
  }

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        {/*
          Currently, the "Clone Configs and Disks" feature exists OUTSIDE of LinodeDetail.
          Or... at least it appears that way to the user. We would like it to live WITHIN
          LinodeDetail, though, because we'd like to use the same context, so we don't
          have to reload all the configs, disks, etc. once we get to the CloneLanding page.
          */}
        <Route component={CloneLanding} path={`${path}/clone`} />
        {['resize', 'rescue', 'migrate', 'upgrade', 'rebuild'].map((path) => (
          <Redirect
            to={{
              pathname: url,
              search: new URLSearchParams({
                ...queryParams,
                [path]: 'true',
              }).toString(),
            }}
            from={`${url}/${path}`}
            key={path}
          />
        ))}
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

export default LinodeDetail;
