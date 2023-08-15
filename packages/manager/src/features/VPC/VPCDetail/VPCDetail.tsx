import * as React from 'react';
import { useParams } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';

const VPCDetails = () => {
  const { vpcId } = useParams<{ vpcId: string }>();
  return (
    <>
      <DocumentTitleSegment segment="VPC" />
      <ProductInformationBanner bannerLocation="VPC" />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'VPC',
              position: 1,
            },
          ],
          labelOptions: { noCap: true },
          pathname: `/vpc/${vpcId}`, // TODO: VPC - use vpc label, not id
        }}
        docsLabel="Docs"
        docsLink="" // TODO: VPC - Add docs link
      />
      TODO: VPC M3-6736 Create VPC Detail page with Summary Section
    </>
  );
};

export default VPCDetails;
