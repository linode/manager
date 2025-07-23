import { regionFactory } from '@linode/utilities';
import { screen, waitFor, within } from '@testing-library/react';
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
      region: 'us-ord',
    } as LinodeObjectStorageDetails;

    renderWithTheme(
      <DestinationLinodeObjectStorageDetailsSummary {...details} />
    );

    expect(
      within(screen.getByText('Host:').closest('div')!).getByText('test host')
    ).toBeInTheDocument();

    expect(
      within(screen.getByText('Bucket:').closest('div')!).getByText(
        'test bucket'
      )
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        within(screen.getByText('Region:').closest('div')!).getByText(
          'US, Chicago, IL'
        )
      ).toBeInTheDocument();
    });

    expect(
      within(screen.getByText('Access Key ID:').closest('div')!).getByText(
        '*****************'
      )
    ).toBeInTheDocument();

    expect(
      within(screen.getByText('Secret Access Key:').closest('div')!).getByText(
        '*****************'
      )
    ).toBeInTheDocument();
  });
});
