import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useAccount } from 'src/queries/account';
import { useFlags } from 'src/hooks/useFlags';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';

const VPCCreate = React.lazy(() => import('./VPCCreate/VPCCreate'));
const VPCDetail = React.lazy(() => import('./VPCDetail/VPCDetail'));
const VPCLanding = React.lazy(() => import('./VPCLanding/VPCLanding'));

const VPC = () => {
  const flags = useFlags();
  const { data: account } = useAccount();

  const showVPCs = isFeatureEnabled(
    'VPCs',
    Boolean(flags.vpc),
    account?.capabilities ?? []
  );

  return (
    <>
    {showVPCs ? 
      <React.Suspense fallback={<SuspenseLoader />}>
        <DocumentTitleSegment segment="VPC" />
        <Switch>
          <Route component={VPCCreate} path="/vpc/create" />
          <Route component={VPCDetail} path="/vpc/:vpcId/:tab?" />
          <Route component={VPCLanding} path="/vpc" />
        </Switch>
      </React.Suspense>
    : null}
    </>
  );
};

export default VPC;
