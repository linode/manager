import React from 'react';
import { Route, useLocation, useRouteMatch } from 'react-router-dom';

import { Stack } from 'src/components/Stack';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { Tabs } from 'src/components/Tabs/Tabs';
import { Typography } from 'src/components/Typography';

const Certificates = React.lazy(() =>
  import('./Certificates').then((module) => ({
    default: module.Certificates,
  }))
);

export const LoadBalancerCertificates = () => {
  const { path, url } = useRouteMatch();
  const location = useLocation();

  const tabs = [
    {
      path: 'downstream',
      title: 'TLS Certificates',
    },
    {
      path: 'ca',
      title: 'Service Target Certificates',
    },
  ];

  const tabIndex = tabs.findIndex((tab) =>
    location.pathname.startsWith(`${url}/${tab.path}`)
  );

  return (
    <Stack paddingTop={1} spacing={1}>
      <Typography>
        Upload certificates to your Load Balancer for use across your
        Configurations and Service Targets.
      </Typography>
      <Tabs index={tabIndex === -1 ? 0 : tabIndex}>
        <TabLinkList
          tabs={tabs.map((t) => ({ ...t, routeName: `${url}/${t.path}` }))}
        />
        <React.Suspense fallback={<SuspenseLoader />}>
          <Route component={Certificates} path={`${path}/:type?/:create?`} />
        </React.Suspense>
      </Tabs>
    </Stack>
  );
};
