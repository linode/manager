import { dataCompressionType } from '@linode/api-v4';
import { screen } from '@testing-library/react';
import React from 'react';
import { expect } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DestinationCustomHTTPSDetailsSummary } from './DestinationCustomHTTPSDetailsSummary';

import type { CustomHTTPSDetails } from '@linode/api-v4';

describe('DestinationCustomHTTPSDetailsSummary', () => {
  it('renders basic authentication details correctly', () => {
    const details: CustomHTTPSDetails = {
      authentication: {
        type: 'basic',
        details: {
          basic_authentication_user: 'testuser',
        },
      },
      endpoint_url: 'https://example.com/',
      data_compression: dataCompressionType.Gzip,
    };

    renderWithTheme(<DestinationCustomHTTPSDetailsSummary {...details} />);

    // Authentication:
    expect(screen.getByText('basic')).toBeVisible();
    // Endpoint URL:
    expect(screen.getByText('https://example.com/')).toBeVisible();
    // Username:
    expect(screen.getByText('testuser')).toBeVisible();
    // Password:
    expect(screen.getByTestId('password')).toHaveTextContent(
      '*****************'
    );
  });

  it('renders none authentication without username and password', () => {
    const details: CustomHTTPSDetails = {
      authentication: {
        type: 'none',
      },
      endpoint_url: 'https://example.com/',
      data_compression: dataCompressionType.Gzip,
    };

    renderWithTheme(<DestinationCustomHTTPSDetailsSummary {...details} />);

    // Authentication:
    expect(screen.getByText('none')).toBeVisible();
    // Endpoint URL:
    expect(screen.getByText('https://example.com/')).toBeVisible();
    // Username:
    expect(screen.queryByText('Username')).not.toBeInTheDocument();
    // Password:
    expect(screen.queryByTestId('password')).not.toBeInTheDocument();
  });

  it('renders client certificate details when provided', () => {
    const details: CustomHTTPSDetails = {
      authentication: { type: 'none' },
      endpoint_url: 'https://example.com/',
      client_certificate_details: {
        tls_hostname: 'tls.example.com',
        client_ca_certificate: 'ca-cert-content',
        client_certificate: 'client-cert-content',
        client_private_key: 'private-key-content',
      },
      data_compression: dataCompressionType.Gzip,
    };

    renderWithTheme(<DestinationCustomHTTPSDetailsSummary {...details} />);

    expect(screen.getByText('Additional Options')).toBeVisible();
    expect(screen.queryByTestId('client-certificate-header')).toBeVisible();
    // TLS Hostname:
    expect(screen.getByText('tls.example.com')).toBeVisible();
    // CA Certificate:
    expect(screen.getByText('ca-cert-content')).toBeVisible();
    // Client Certificate:
    expect(screen.getByText('client-cert-content')).toBeVisible();
    // Client Key:
    expect(screen.getByText('private-key-content')).toBeVisible();
  });

  it('renders content type when provided', () => {
    const details: CustomHTTPSDetails = {
      authentication: { type: 'none' },
      endpoint_url: 'https://example.com/',
      content_type: 'application/json',
      data_compression: dataCompressionType.Gzip,
    };

    renderWithTheme(<DestinationCustomHTTPSDetailsSummary {...details} />);

    expect(screen.getByText('HTTPS Headers')).toBeVisible();
    expect(screen.getByText('application/json')).toBeVisible();
  });

  it('renders custom headers when provided', () => {
    const details: CustomHTTPSDetails = {
      authentication: { type: 'none' },
      endpoint_url: 'https://example.com/',
      custom_headers: [
        { name: 'X-Custom-Header', value: 'custom-value' },
        { name: 'Authorization', value: 'Bearer token123' },
      ],
      data_compression: dataCompressionType.Gzip,
    };

    renderWithTheme(<DestinationCustomHTTPSDetailsSummary {...details} />);

    expect(screen.getByText('HTTPS Headers')).toBeVisible();
    // Custom Header 1:
    expect(screen.getByText('X-Custom-Header')).toBeVisible();
    expect(screen.getByText('custom-value')).toBeVisible();
    // Custom Header 2:
    expect(screen.getByText('Authorization')).toBeVisible();
    expect(screen.getByText('Bearer token123')).toBeVisible();
  });

  it('does not render Additional Options section when no optional fields provided', () => {
    const details: CustomHTTPSDetails = {
      authentication: { type: 'none' },
      endpoint_url: 'https://example.com/',
      data_compression: dataCompressionType.Gzip,
    };

    renderWithTheme(<DestinationCustomHTTPSDetailsSummary {...details} />);

    expect(screen.queryByText('Additional Options')).not.toBeInTheDocument();
    expect(screen.queryByText('HTTPS Headers')).not.toBeInTheDocument();
  });
});
