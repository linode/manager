import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle/DocumentTitle';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';

const LoadBalancerCreate = () => {
  return (
    <>
      <DocumentTitleSegment segment="Load Balancers" />
      <ProductInformationBanner
        bannerLocation="LoadBalancers"
        important
        warning
      />
      TODO: AGLB M3-6815: Load Balancer Create
    </>
  );
};

export default LoadBalancerCreate;
