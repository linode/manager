import { Typography } from '@linode/ui';
import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Link } from 'src/components/Link';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

export const ImagesRoute = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DismissibleBanner
        preferenceKey="image-encryption-is-standard"
        spacingBottom={8}
        variant="info"
      >
        <Typography fontSize="inherit" py={1}>
          Custom Images are now encrypted by default for enhanced security.{' '}
          <Link to="https://techdocs.akamai.com/cloud-computing/docs/capture-an-image#capture-an-image">
            Learn more
          </Link>
          .
        </Typography>
      </DismissibleBanner>
      <DocumentTitleSegment segment="Images" />
      <ProductInformationBanner bannerLocation="Images" />
      <Outlet />
    </React.Suspense>
  );
};
