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
        preferenceKey="image-encryption"
        spacingBottom={8}
        variant="info"
      >
        <Typography fontSize="inherit" py={1}>
          Encryption is automatically applied when you create a new image.
          Older, unencrypted images will be automatically encrypted with an
          upcoming release, or you can{' '}
          <Link to="https://techdocs.akamai.com/cloud-computing/docs/capture-an-image#capture-an-image">
            recreate
          </Link>{' '}
          the image.
        </Typography>
      </DismissibleBanner>
      <DocumentTitleSegment segment="Images" />
      <ProductInformationBanner bannerLocation="Images" />
      <Outlet />
    </React.Suspense>
  );
};
