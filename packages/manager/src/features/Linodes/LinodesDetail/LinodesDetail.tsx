import { useLinodeQuery } from '@linode/queries';
import { CircleProgress, ErrorState } from '@linode/ui';
import { useMatch, useNavigate, useParams } from '@tanstack/react-router';
import * as React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { UpgradeInterfacesDialog } from './LinodeConfigs/UpgradeInterfaces/UpgradeInterfacesDialog';

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
  const { linodeId } = useParams({ from: '/linodes/$linodeId' });
  const navigate = useNavigate();
  const match = useMatch({ strict: false });

  const closeUpgradeInterfacesDialog = () => {
    const newPath =
      match.routeId === '/linodes/$linodeId/upgrade-interfaces'
        ? match.pathname.split('/').slice(0, -1).join('/')
        : match.pathname;
    navigate({ to: newPath });
  };

  const { data: linode, error, isLoading } = useLinodeQuery(linodeId);

  if (error) {
    return <ErrorState errorText={error?.[0].reason} />;
  }

  if (isLoading || !linode) {
    return <CircleProgress />;
  }

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      {/*
          Currently, the "Clone Configs and Disks" feature exists OUTSIDE of LinodeDetail.
          Or... at least it appears that way to the user. We would like it to live WITHIN
          LinodeDetail, though, because we'd like to use the same context, so we don't
          have to reload all the configs, disks, etc. once we get to the CloneLanding page.
          */}
      {/* <Route component={CloneLanding} path={`${path}/clone`} />
        {['resize', 'rescue', 'migrate', 'upgrade', 'rebuild'].map((path) => (
          <Redirect
            from={`${url}/${path}`}
            key={path}
            to={{
              pathname: url,
              search: new URLSearchParams({
                ...queryParams,
                [path]: 'true',
              }).toString(),
            }}
          />
        ))} */}
      {/* <CloneLanding /> */}
      <LinodesDetailHeader />
      <LinodesDetailNavigation />
      <UpgradeInterfacesDialog
        linodeId={linodeId}
        onClose={closeUpgradeInterfacesDialog}
        open={match.routeId === '/linodes/$linodeId/upgrade-interfaces'}
      />
    </React.Suspense>
  );
};
