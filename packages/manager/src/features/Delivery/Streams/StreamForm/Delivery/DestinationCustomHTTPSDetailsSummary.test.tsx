import { type CustomHTTPSDetails, dataCompressionType } from '@linode/api-v4';
import { screen } from '@testing-library/react';
import React from 'react';
import { expect } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DestinationCustomHTTPSDetailsSummary } from './DestinationCustomHTTPSDetailsSummary';

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
    expect(screen.getByTestId('username')).toHaveTextContent(
      '*****************'
    );
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

  describe('Bearer Token authentication details load in edit mode', () => {
    it('render only hidden Bearer Token field when no details provided', async () => {
      const details: CustomHTTPSDetails = {
        authentication: {
          type: 'bearer_token',
        },
        endpoint_url: 'https://example.com/',
        data_compression: dataCompressionType.Gzip,
      };
      renderWithTheme(<DestinationCustomHTTPSDetailsSummary {...details} />);

      // Bearer Token hidden:
      expect(screen.getByTestId('bearer-token')).toHaveTextContent(
        '*****************'
      );
      // Header Name empty not rendered:
      expect(
        screen.queryByTestId('bearer-header-name')
      ).not.toBeInTheDocument();
      // Token Prefix empty not rendered:
      expect(
        screen.queryByTestId('bearer-token-prefix')
      ).not.toBeInTheDocument();
    });

    it('redner all provided details', async () => {
      const details: CustomHTTPSDetails = {
        authentication: {
          type: 'bearer_token',
          details: {
            bearer_token_authentication_header_name: 'X-Authorization',
            bearer_token_authentication_token_prefix: 'CustomBearer',
          },
        },
        endpoint_url: 'https://example.com/',
        data_compression: dataCompressionType.Gzip,
      };
      renderWithTheme(<DestinationCustomHTTPSDetailsSummary {...details} />);

      // Bearer Token hidden:
      expect(screen.getByTestId('bearer-token')).toHaveTextContent(
        '*****************'
      );
      // Header Name:
      expect(screen.getByText('X-Authorization')).toBeVisible();
      // Token Prefix:
      expect(screen.getByText('CustomBearer')).toBeVisible();
    });
  });

  it('renders Client Certificate Authentication details when provided', () => {
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

    expect(screen.getByText('Connection Settings')).toBeVisible();
    expect(screen.queryByTestId('client-certificate-header')).toBeVisible();
    // TLS Hostname:
    expect(screen.getByText('tls.example.com')).toBeVisible();
    // CA Certificate:
    expect(screen.getByText('ca-cert-content')).toBeVisible();
    // Client Certificate:
    expect(screen.getByText('client-cert-content')).toBeVisible();
    // Client Key:
    expect(screen.getByTestId('client-key')).toHaveTextContent(
      '*****************'
    );
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

  it('does not render Connection Settings section when no optional fields provided', () => {
    const details: CustomHTTPSDetails = {
      authentication: { type: 'none' },
      endpoint_url: 'https://example.com/',
      data_compression: dataCompressionType.Gzip,
    };

    renderWithTheme(<DestinationCustomHTTPSDetailsSummary {...details} />);

    expect(screen.queryByText('Connection Settings')).not.toBeInTheDocument();
    expect(screen.queryByText('HTTPS Headers')).not.toBeInTheDocument();
  });
});
