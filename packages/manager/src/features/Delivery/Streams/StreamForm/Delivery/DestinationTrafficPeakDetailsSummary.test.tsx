import { dataCompressionType, type TrafficPeakDetails } from '@linode/api-v4';
import { screen } from '@testing-library/react';
import React from 'react';
import { expect } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DestinationTrafficPeakDetailsSummary } from './DestinationTrafficPeakDetailsSummary';

describe('DestinationTrafficPeakDetailsSummary', () => {
  it('renders endpoint URL, authentication type, and masked credentials', () => {
    const details: TrafficPeakDetails = {
      authentication: {
        type: 'basic',
      },
      endpoint_url: 'https://example.com/',
      data_compression: dataCompressionType.Gzip,
    };

    renderWithTheme(<DestinationTrafficPeakDetailsSummary {...details} />);

    expect(screen.getByText('https://example.com/')).toBeVisible();
    expect(screen.getByText('Basic')).toBeVisible();
    expect(screen.getByTestId('username')).toHaveTextContent(
      '*****************'
    );
    expect(screen.getByTestId('password')).toHaveTextContent(
      '*****************'
    );
  });

  it('renders content type when provided', () => {
    const details: TrafficPeakDetails = {
      authentication: {
        type: 'basic',
      },
      endpoint_url: 'https://example.com/',
      content_type: 'application/json',
      data_compression: dataCompressionType.Gzip,
    };

    renderWithTheme(<DestinationTrafficPeakDetailsSummary {...details} />);

    expect(screen.getByText('HTTPS Headers')).toBeVisible();
    expect(screen.getByText('application/json')).toBeVisible();
  });

  it('renders custom headers when provided', () => {
    const details: TrafficPeakDetails = {
      authentication: {
        type: 'basic',
      },
      endpoint_url: 'https://example.com/',
      custom_headers: [
        { name: 'X-Custom-Header', value: 'custom-value' },
        { name: 'Authorization', value: 'Bearer token123' },
      ],
      data_compression: dataCompressionType.Gzip,
    };

    renderWithTheme(<DestinationTrafficPeakDetailsSummary {...details} />);

    expect(screen.getByText('HTTPS Headers')).toBeVisible();
    // Custom Header 1:
    expect(screen.getByText('X-Custom-Header')).toBeVisible();
    expect(screen.getByText('custom-value')).toBeVisible();
    // Custom Header 2:
    expect(screen.getByText('Authorization')).toBeVisible();
    expect(screen.getByText('Bearer token123')).toBeVisible();
  });

  it('does not render HTTPS Headers section when no fields provided', () => {
    const details: TrafficPeakDetails = {
      authentication: {
        type: 'basic',
      },
      endpoint_url: 'https://example.com/',
      data_compression: dataCompressionType.Gzip,
    };

    renderWithTheme(<DestinationTrafficPeakDetailsSummary {...details} />);

    expect(screen.queryByText('HTTPS Headers')).not.toBeInTheDocument();
  });
});
