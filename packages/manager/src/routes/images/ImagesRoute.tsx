import { Typography } from '@linode/ui';
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import React, { useEffect } from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Link } from 'src/components/Link';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useIsPrivateImageSharingEnabled } from 'src/features/Images/utils';

export const ImagesRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isPrivateImageSharingEnabled } = useIsPrivateImageSharingEnabled();

  // Handle navigation between legacy /images and new tabbed UI based on feature flag.
  // Redirects to the appropriate route on initial load and when the feature flag toggles at runtime.
  // - When flag is ON: /images redirects to /images/image-library
  // - When flag is OFF: /images/image-library or /images/share-groups redirect back to /images (legacy)
  useEffect(() => {
    if (location.pathname.startsWith('/images')) {
      // Redirect to Image Library tab when feature flag is enabled
      if (isPrivateImageSharingEnabled && location.pathname === '/images') {
        navigate({
          to: '/images/image-library',
          search: { subType: 'owned' },
          replace: true,
        });
      } else if (
        // Redirect to legacy route when feature flag is disabled
        !isPrivateImageSharingEnabled &&
        (location.pathname.startsWith('/images/image-library') ||
          location.pathname.startsWith('/images/share-groups'))
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
