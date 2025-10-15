import { LinkButton, Typography } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import { DateTime } from 'luxon';
import React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Link } from 'src/components/Link';

const NOTIFICATION_KEY = 'obj-billing-notification';

export const BillingNotice = React.memo(() => {
  const navigate = useNavigate();

  return (
    <DismissibleBanner
      options={{
        expiry: DateTime.utc().plus({ days: 30 }).toISO(),
        label: NOTIFICATION_KEY,
      }}
      preferenceKey={NOTIFICATION_KEY}
      variant="warning"
    >
      <Typography variant="body1">
        You are being billed for Object Storage but do not have any Buckets. You
        can cancel Object Storage in your{' '}
        <Link to="/account/settings">Account Settings</Link>, or{' '}
        <LinkButton
          onClick={() => navigate({ to: '/object-storage/buckets/create' })}
        >
          create a Bucket.
        </LinkButton>
      </Typography>
    </DismissibleBanner>
  );
});
