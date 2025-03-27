import {
  useAccountSettings,
  useLinodeQuery,
  useRegionsQuery,
} from '@linode/queries';
import { CircleProgress, ErrorState } from '@linode/ui';
import { getQueryParamsFromQueryString } from '@linode/utilities';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-dom';

import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { UpgradeInterfacesDialog } from './LinodeConfigs/UpgradeInterfaces/UpgradeInterfacesDialog';

import type { LinodeConfigAndDiskQueryParams } from 'src/features/Linodes/types';

const LinodesDetailHeader = React.lazy(() =>
  import(
    'src/features/Linodes/LinodesDetail/LinodesDetailHeader/LinodeDetailHeader'
  ).then((module) => ({
    default: module.LinodeDetailHeader,
  }))
);
const LinodesDetailNavigation = React.lazy(
  () => import('./LinodesDetailNavigation')
);
const CloneLanding = React.lazy(() =>
  import('src/features/Linodes/CloneLanding/CloneLanding').then((module) => ({
    default: module.CloneLanding,
  }))
);

export const LinodeDetail = () => {
  const { path, url } = useRouteMatch();
  const { linodeId } = useParams<{ linodeId: string }>();
  const location = useLocation();
  const history = useHistory();

  const queryParams = getQueryParamsFromQueryString<LinodeConfigAndDiskQueryParams>(
    location.search
  );

  const pathname = location.pathname;

  const closeUpgradeInterfacesDialog = () => {
    const newPath = pathname.includes('upgrade-interfaces')
      ? pathname.split('/').slice(0, -1).join('/')
      : pathname;
    history.replace(newPath);
  };

  const id = Number(linodeId);

  const { data: linode, error, isLoading } = useLinodeQuery(id);
  const { data: regions } = useRegionsQuery();
  const { data: accountSettings } = useAccountSettings();
  const regionSupportsLinodeInterfaces =
    regions
      ?.find((r) => r.id === linode?.region)
      ?.capabilities.includes('Linode Interfaces') ?? false;

  const showUpgradeInterfacesDialog =
    // show the Upgrade Interfaces button if our Linode is not part of an LKE cluster, is
    // using Legacy config profile interfaces in a region that supports the new Interfaces
    // and our account can have Linodes using new interfaces
    linode?.interface_generation !== 'linode' &&
    !linode?.lke_cluster_id &&
    accountSettings?.interfaces_for_new_linodes !== 'legacy_config_only' &&
    regionSupportsLinodeInterfaces;

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
              <UpgradeInterfacesDialog
                open={
                  pathname.includes('upgrade-interfaces') &&
                  showUpgradeInterfacesDialog
                }
                linodeId={id}
                onClose={closeUpgradeInterfacesDialog}
              />
            </React.Fragment>
          )}
        />
      </Switch>
    </React.Suspense>
  );
};

export const linodeDetailLazyRoute = createLazyRoute('/linodes/$linodeId')({
  component: LinodeDetail,
});
