import React from 'react';
import { useHistory } from 'react-router-dom';

import { LandingHeader } from 'src/components/LandingHeader';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';

import LoadBalancerTable from './LoadBalancerTable';

const LOADBALANCER_CREATE_ROUTE = 'loadbalancers/create';

const LoadBalancerLanding = () => {
  const history = useHistory();

  const createLoadBalancer = () => {
    history.push(LOADBALANCER_CREATE_ROUTE);
  };

  return (
    <>
      <ProductInformationBanner
        bannerLocation="LoadBalancers"
        important
        warning
      />
      <LandingHeader
        breadcrumbProps={{ pathname: '/loadbalancers' }}
        createButtonText="Create Loadbalancer"
        docsLabel="Docs"
        docsLink="" // TODO: AGLB -  Add docs link
        entity="Global Load Balancers"
        onButtonClick={createLoadBalancer}
        removeCrumbX={1}
        title="Global Load Balancers"
      />
      <LoadBalancerTable />
    </>
  );
};

export default LoadBalancerLanding;
