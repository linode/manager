import { Typography } from '@linode/ui';
import { Outlet, useNavigate } from '@tanstack/react-router';
import React, { useEffect } from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Link } from 'src/components/Link';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useIsPrivateImageSharingEnabled } from 'src/features/Images/utils';

export const ImagesRoute = () => {
  const navigate = useNavigate();

  const { isPrivateImageSharingEnabled } = useIsPrivateImageSharingEnabled();

  useEffect(() => {
    if (location.pathname.startsWith('/images')) {
      if (isPrivateImageSharingEnabled && location.pathname === '/images') {
        navigate({
          to: '/images/images',
          search: { subType: 'custom' },
          replace: true,
        });
      } else if (
        !isPrivateImageSharingEnabled &&
        location.pathname.startsWith('/images/images')
      ) {
        navigate({ to: '/images', replace: true });
      }
    }
  }, [isPrivateImageSharingEnabled, location.pathname, navigate]);

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DismissibleBanner
        preferenceKey="image-encryption-is-standard"
        spacingBottom={8}
        variant="info"
      >
        <Typography fontSize="inherit">
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
