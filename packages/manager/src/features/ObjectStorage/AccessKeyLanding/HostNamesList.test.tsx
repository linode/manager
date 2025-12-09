import { regionFactory } from '@linode/utilities';
import { screen } from '@testing-library/react';
import React from 'react';

import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { HostNamesList } from './HostNamesList';

const mockObjectStorageKey = {
  access_key: 'test',
  bucket_access: null,
  id: 0,
  label: 'test-label',
  limited: false,
  regions: [{ id: 'us-central', s3_endpoint: 'http://example.com' }],
  secret_key: 'testKey',
};

describe('HostNamesList', () => {
  it('renders without crashing', async () => {
    server.use(
      http.get('*/regions', () => {
        const regions = regionFactory.buildList(1, {
          id: 'us-central',
          label: 'Fake Region, NC',
        });
        return HttpResponse.json(makeResourcePage(regions));
      })
    );

    renderWithTheme(<HostNamesList objectStorageKey={mockObjectStorageKey} />);

    const copyButton = await screen.findByLabelText(
      'Copy US, Fake Region, NC: http://example.com to clipboard'
    );
    expect(copyButton).toBeInTheDocument();
  });
});
