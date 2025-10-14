import { screen } from '@testing-library/react';
import React from 'react';
import { expect } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DestinationAkamaiObjectStorageDetailsSummary } from './DestinationAkamaiObjectStorageDetailsSummary';

import type { AkamaiObjectStorageDetails } from '@linode/api-v4';

describe('DestinationAkamaiObjectStorageDetailsSummary', () => {
  it('renders all destination details correctly', async () => {
    const details = {
      bucket_name: 'test bucket',
      host: 'test host',
      path: 'test/path',
    } as AkamaiObjectStorageDetails;

    renderWithTheme(
      <DestinationAkamaiObjectStorageDetailsSummary {...details} />
    );

    // Host:
    expect(screen.getByText('test host')).toBeVisible();
    // Bucket:
    expect(screen.getByText('test bucket')).toBeVisible();
    // Log Path:
    expect(screen.getByText('test/path')).toBeVisible();
    expect(screen.queryByTestId('tooltip-info-icon')).not.toBeInTheDocument();
    // Access Key ID:
    expect(screen.getByTestId('access-key-id')).toHaveTextContent(
      '*****************'
    );
    // Secret Access Key:
    expect(screen.getByTestId('secret-access-key')).toHaveTextContent(
      '*****************'
    );
  });

  it('renders info icon next to path when it is empty', async () => {
    const details = {
      bucket_name: 'test bucket',
      host: 'test host',
      path: '',
    } as AkamaiObjectStorageDetails;

    renderWithTheme(
      <DestinationAkamaiObjectStorageDetailsSummary {...details} />
    );

    // Log Path info icon:
    expect(screen.getByTestId('tooltip-info-icon')).toBeVisible();
  });
});
