import { Typography } from '@linode/ui';
import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Link } from 'src/components/Link';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

export const LongviewRoute = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DismissibleBanner
        dismissible={false}
        preferenceKey="longview-gpg-key-update"
        spacingBottom={8}
        title="Update required: Longview GPG key"
        variant="warning"
      >
        <Typography fontSize="inherit">
          <b>Update required: Longview GPG key</b> <br />
          The current Longview GPG key used for APT package verification will be
          revoked on January 5, 2026. To ensure uninterrupted package
          installations and updates for Longview, please update your system to
          trust the new key by following the instructions{' '}
          <Link to="https://techdocs.akamai.com/cloud-computing/docs/troubleshooting-linode-longview#longview-gpg-apt-signing-key-update">
            here.
          </Link>
        </Typography>
      </DismissibleBanner>
      <DocumentTitleSegment segment="Longview" />
      <ProductInformationBanner bannerLocation="Longview" />
      <Outlet />
    </React.Suspense>
  );
};
