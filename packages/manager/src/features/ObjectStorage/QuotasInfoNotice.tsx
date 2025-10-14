import { Typography } from '@linode/ui';
import React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Link } from 'src/components/Link';

export const QuotasInfoNotice = ({ action }: { action: string }) => {
  return (
    <DismissibleBanner
      preferenceKey="quotas-info-banner"
      spacingBottom={8}
      variant="info"
    >
      <Typography fontSize="inherit">
        Did you know you can check your usage and quotas before {action}?{' '}
        <Link to="/account/quotas">View Quotas</Link>.
      </Typography>
    </DismissibleBanner>
  );
};
