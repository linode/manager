import { Divider, Typography } from '@linode/ui';
import React from 'react';

import { MASKED_VALUE } from 'src/features/Delivery/Destinations/constants';
import { LabelValue } from 'src/features/Delivery/Shared/LabelValue';

import type { CustomHTTPSDetails } from '@linode/api-v4';

export const DestinationCustomHTTPSDetailsSummary = (
  props: CustomHTTPSDetails
) => {
  const {
    authentication,
    endpoint_url,
    client_certificate_details,
    content_type,
    custom_headers,
  } = props;

  return (
    <>
      <LabelValue label="Authentication Type" value={authentication.type} />
      <LabelValue label="Endpoint URL" value={endpoint_url} />
      {authentication.type === 'basic' && (
        <>
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
        </>
      )}
      <Divider sx={{ my: 3 }} />
      {(!!client_certificate_details || !!content_type || !!custom_headers) && (
        <>
          <Typography sx={{ mt: 0 }} variant="h2">
            Connection Settings
          </Typography>
          {!!client_certificate_details && (
            <>
              <Typography
                data-testid="client-certificate-header"
                sx={{ mt: 2 }}
                variant="h3"
              >
                Client Certificate Authentication
              </Typography>
              <LabelValue
                label="TLS Hostname"
                value={client_certificate_details.tls_hostname!}
              />
              <LabelValue
                copyable
                disableValueTooltip
                label="CA Certificate"
                value={client_certificate_details.client_ca_certificate!}
              />
              <LabelValue
                copyable
                disableValueTooltip
                label="Client Certificate"
                value={client_certificate_details.client_certificate!}
              />
              <LabelValue
                data-testid="client-key"
                label="Client Private Key"
                value={MASKED_VALUE}
              />
            </>
          )}
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
              <LabelValue
                key={`custom-header-${idx}`}
                label={name}
                value={value}
              />
            ))}
        </>
      )}
    </>
  );
};
