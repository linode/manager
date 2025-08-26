import { regionFactory } from '@linode/utilities';
import { screen, waitFor } from '@testing-library/react';
import React from 'react';

import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DestinationLinodeObjectStorageDetailsSummary } from './DestinationLinodeObjectStorageDetailsSummary';

import type { LinodeObjectStorageDetails } from '@linode/api-v4';

describe('DestinationLinodeObjectStorageDetailsSummary', () => {
  it('renders all destination details correctly', async () => {
    server.use(
      http.get('*/regions', () => {
        const regions = regionFactory.buildList(1, {
          id: 'us-ord',
          label: 'Chicago, IL',
        });
        return HttpResponse.json(makeResourcePage(regions));
      })
    );

    const details = {
      bucket_name: 'test bucket',
      host: 'test host',
      path: 'test/path',
      region: 'us-ord',
    } as LinodeObjectStorageDetails;

    renderWithTheme(
      <DestinationLinodeObjectStorageDetailsSummary {...details} />
    );

    // Host:
    expect(screen.getByText('test host')).toBeVisible();
    // Bucket:
    expect(screen.getByText('test bucket')).toBeVisible();
    // Log Path:
    expect(screen.getByText('test/path')).toBeVisible();
    // Region:
    await waitFor(() => {
      expect(screen.getByText('US, Chicago, IL')).toBeVisible();
    });
    // Access Key ID:
    expect(screen.getByTestId('access-key-id')).toHaveTextContent(
      '*****************'
    );
    // Secret Access Key:
    expect(screen.getByTestId('secret-access-key')).toHaveTextContent(
      '*****************'
    );
  });
});
