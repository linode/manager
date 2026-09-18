import { TrafficPeakDetails } from '@linode/api-v4';
import { Divider, Typography } from '@linode/ui';
import React from 'react';

import { MASKED_VALUE } from 'src/features/Delivery/Destinations/constants';
import { LabelValue } from 'src/features/Delivery/Shared/LabelValue';

export const DestinationTrafficPeakDetailsSummary = (
  props: TrafficPeakDetails
) => {
  const { endpoint_url, content_type, custom_headers } = props;

  return (
    <>
      <LabelValue label="Endpoint URL" value={endpoint_url} />
      <Divider sx={{ my: 3 }} />
      <Typography sx={{ mt: 0 }} variant="h2">
        Advanced Settings
      </Typography>
      <LabelValue label="Authentication Type" value="Basic" />
      <LabelValue
        data-testid="username"
        label="Username"
        value={MASKED_VALUE}
      />
      <LabelValue
        data-testid="password"
        label="Password"
        value={MASKED_VALUE}
      />

      {(!!content_type || !!custom_headers) && (
        <Typography sx={{ mt: 2 }} variant="h3">
          HTTPS Headers
        </Typography>
      )}
      {!!content_type && (
        <LabelValue label="Content Type" value={content_type} />
      )}
      {!!custom_headers &&
        custom_headers.map(({ name, value }, idx) => (
          <LabelValue key={`custom-header-${idx}`} label={name} value={value} />
        ))}
    </>
  );
};
