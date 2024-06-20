import '@testing-library/jest-dom';
import { waitFor } from '@testing-library/react';
import React from 'react';

import { objectStorageKeyFactory, regionFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { HostNameTableCell } from './HostNameTableCell';

const storageKeyData = objectStorageKeyFactory.build({
  regions: [
    {
      id: 'us-east',
      s3_endpoint: 'alpha.test.com',
    },
  ],
});

describe('HostNameTableCell', () => {
  it('should render  "None" when there are no regions', () => {
    const { getByText } = renderWithTheme(
      <HostNameTableCell
        storageKeyData={{
          access_key: 'test_key',
          bucket_access: null,
          id: 0,
          label: 'test',
          limited: false,
          regions: [],
          secret_key: '',
        }}
        setHostNames={vi.fn()}
        setShowHostNamesDrawers={vi.fn()}
      />
    );

    expect(getByText('None')).toBeInTheDocument();
  });

  test('should render  "Regions/S3 Hostnames" cell when there are regions', async () => {
    const region = regionFactory.build({
      capabilities: ['Object Storage'],
      id: 'us-east',
      label: 'Newark, NJ',
    });

    server.use(
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      })
    );
    const { findByText } = renderWithTheme(
      <HostNameTableCell
        setHostNames={vi.fn()}
        setShowHostNamesDrawers={vi.fn()}
        storageKeyData={storageKeyData}
      />
    );

    const hostname = await findByText('Newark, NJ: alpha.test.com');

    await waitFor(() => expect(hostname).toBeInTheDocument());
  });
  test('should render all  "Regions/S3 Hostnames" in the cell when there are multiple regions', async () => {
    const region = regionFactory.build({
      capabilities: ['Object Storage'],
      id: 'us-east',
      label: 'Newark, NJ',
    });

    server.use(
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      })
    );
    const { findByText } = renderWithTheme(
      <HostNameTableCell
        storageKeyData={{
          ...storageKeyData,
          regions: [
            {
              id: 'us-east',
              s3_endpoint: 'alpha.test.com',
            },
            {
              id: 'us-south',
              s3_endpoint: 'alpha.test.com',
            },
          ],
        }}
        setHostNames={vi.fn()}
        setShowHostNamesDrawers={vi.fn()}
      />
    );
    const hostname = await findByText('Newark, NJ: alpha.test.com');
    const moreButton = await findByText(/and\s+1\s+more\.\.\./);
    await waitFor(() => expect(hostname).toBeInTheDocument());

    await expect(moreButton).toBeInTheDocument();
  });
});
