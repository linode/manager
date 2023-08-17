import React from 'react';
import { useHistory } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';

import LoadBalancerTable from './LoadBalancerTable';

const LoadBalancerLanding = () => {
  const history = useHistory();

  return (
    <>
      <DocumentTitleSegment segment="Global Load Balancers" />
      <LandingHeader
        breadcrumbProps={{ pathname: '/loadbalancers' }}
        createButtonText="Create Loadbalancer"
        docsLabel="Docs"
        docsLink="" // TODO: AGLB -  Add docs link
        entity="Global Load Balancers"
        onButtonClick={() => history.push('/loadbalancers/create')}
        removeCrumbX={1}
        title="Global Load Balancers"
      />
      <LoadBalancerTable />
    </>
  );
};

export default LoadBalancerLanding;
