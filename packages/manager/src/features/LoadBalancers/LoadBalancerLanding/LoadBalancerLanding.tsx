import React from 'react';
import { useHistory } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { useLoadBalancersQuery } from 'src/queries/aglb/loadbalancers';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { LoadBalancerLandingEmptyState } from './LoadBalancerLandingEmptyState';
import LoadBalancerTable from './LoadBalancerTable';
const LOADBALANCER_CREATE_ROUTE = 'loadbalancers/create';

const LoadBalancerLanding = () => {
  const history = useHistory();

  const createLoadBalancer = () => {
    history.push(LOADBALANCER_CREATE_ROUTE);
  };

  const { data: loadBalancers, error, isLoading } = useLoadBalancersQuery();

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(error, 'Error loading your LoadBalancers.')[0]
            .reason
        }
      />
    );
  }

  if (loadBalancers?.data.length === 0) {
    return <LoadBalancerLandingEmptyState />;
  }

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
