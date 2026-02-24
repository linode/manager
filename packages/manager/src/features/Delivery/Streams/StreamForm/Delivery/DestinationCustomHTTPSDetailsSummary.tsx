import { Divider, Typography } from '@linode/ui';
import React from 'react';

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
      <LabelValue label="Authentication" value={authentication.type} />
      <LabelValue label="Endpoint URL" value={endpoint_url} />
      {authentication.type === 'basic' && (
        <>
          <LabelValue
            label="Username"
            value={authentication.details!.basic_authentication_user!}
          />
          <LabelValue
            data-testid="password"
            label="Password"
            value="*****************"
          />
        </>
      )}
      <Divider sx={{ my: 3 }} />
      {(!!client_certificate_details || !!content_type || !!custom_headers) && (
        <>
          <Typography sx={{ mt: 0 }} variant="h2">
            Additional Options
          </Typography>
          {!!client_certificate_details && (
            <>
              <Typography
                data-testid="client-certificate-header"
                sx={{ mt: 2 }}
                variant="h3"
              >
                Client Certificate
              </Typography>
              <LabelValue
                label="TLS Hostname"
                value={client_certificate_details.tls_hostname!}
              />
              <LabelValue
                label="CA Certificate"
                value={client_certificate_details.client_ca_certificate!}
              />
              <LabelValue
                label="Client Certificate"
                value={client_certificate_details.client_certificate!}
              />
              <LabelValue
                label="Client Key"
                value={client_certificate_details.client_private_key!}
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
