import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account';
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
      {showVPCs ? (
        <React.Suspense fallback={<SuspenseLoader />}>
          <DocumentTitleSegment segment="VPC" />
          <ProductInformationBanner bannerLocation="VPC" />
          <Switch>
            <Route component={VPCCreate} path="/vpcs/create" />
            <Route component={VPCDetail} path="/vpcs/:vpcId/:tab?" />
            <Route component={VPCLanding} path="/vpcs" />
          </Switch>
        </React.Suspense>
      ) : null}
    </>
  );
};

export default VPC;
