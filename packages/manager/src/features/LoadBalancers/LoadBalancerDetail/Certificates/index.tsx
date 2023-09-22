import Stack from '@mui/material/Stack';
import React from 'react';
import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation,
  useRouteMatch,
} from 'react-router-dom';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Tabs } from 'src/components/ReachTabs';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { TabLinkList } from 'src/components/TabLinkList/TabLinkList';
import { Typography } from 'src/components/Typography';

import { ServiceTargetCertificates } from './ServiceTargetCertificates';
import { TLSCertificates } from './TLSCertificates';

export const LoadBalancerCertificates = () => {
  const { path, url } = useRouteMatch();
  const location = useLocation();
  const history = useHistory();

  const tabs = [
    {
      component: TLSCertificates,
      path: 'tls',
      title: 'TLS Certificates',
    },
    {
      component: ServiceTargetCertificates,
      path: 'service-target',
      title: 'Service Target Certificates',
    },
  ];

  const tabIndex = tabs.findIndex((tab) =>
    location.pathname.startsWith(`${url}/${tab.path}`)
  );

  return (
    <>
      <Stack alignItems="center" direction="row" justifyContent="space-between">
        <Typography>
          Upload certificates to your Load Balancer for use across your
          Configurations and Service Targets.
        </Typography>
        <Box flexGrow={1} />
        <Button
          buttonType="primary"
          onClick={() => history.push(location.pathname + '/create')}
        >
          Upload Certificate
        </Button>
      </Stack>
      <Tabs index={tabIndex === -1 ? 0 : tabIndex}>
        <TabLinkList
          tabs={tabs.map((t) => ({ ...t, routeName: `${url}/${t.path}` }))}
        />
        <React.Suspense fallback={<SuspenseLoader />}>
          <Switch>
            <Route component={TLSCertificates} path={`${path}/tls/create`} />
            <Route component={TLSCertificates} path={`${path}/tls`} />
            <Route
              component={ServiceTargetCertificates}
              path={`${path}/service-target`}
            />
            <Route
              component={ServiceTargetCertificates}
              path={`${path}/service-target/create`}
            />
            <Redirect to={`${path}/tls`} />
          </Switch>
        </React.Suspense>
      </Tabs>
    </>
  );
};
