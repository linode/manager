import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';

const VPCCreate = React.lazy(() => import('./VPCCreate/VPCCreate'));
const VPCDetails = React.lazy(() => import('./VPCDetails/VPCDetails'));
const VPCLanding = React.lazy(() => import('./VPCLanding/VPCLanding'));

const VPC = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={VPCCreate} path="/vpc/create" />
        <Route component={VPCDetails} path="/vpc/:vpcId/:tab?" />
        <Route component={VPCLanding} path="/vpc" />
      </Switch>
    </React.Suspense>
  );
};

export default VPC;
