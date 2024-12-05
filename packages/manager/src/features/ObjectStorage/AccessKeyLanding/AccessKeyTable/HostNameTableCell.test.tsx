import '@testing-library/jest-dom';
import { waitFor } from '@testing-library/react';
import React from 'react';

import { objectStorageKeyFactory, regionFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { HostNameTableCell } from './HostNameTableCell';

describe('HostNameTableCell', () => {
  it('should render  "None" when there are no regions', () => {
    const storageKeyData = objectStorageKeyFactory.build({
      regions: [],
    });
    const { getByText } = renderWithTheme(
      <HostNameTableCell
        setHostNames={vi.fn()}
        setShowHostNamesDrawers={vi.fn()}
        storageKeyData={storageKeyData}
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
    const storageKeyData = objectStorageKeyFactory.build({
      regions: [
        {
          id: 'us-east',
          s3_endpoint: 'alpha.test.com',
        },
      ],
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

    const hostname = await findByText('US, Newark, NJ: alpha.test.com');

    await waitFor(() => expect(hostname).toBeInTheDocument());
  });
  test('should render all  "Regions/S3 Hostnames" in the cell when there are multiple regions', async () => {
    const region = regionFactory.build({
      capabilities: ['Object Storage'],
      id: 'us-east',
      label: 'Newark, NJ',
    });
    const storageKeyData = objectStorageKeyFactory.build({
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
    });

    server.use(
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      })
    );
    const { getByText } = renderWithTheme(
      <HostNameTableCell
        setHostNames={vi.fn()}
        setShowHostNamesDrawers={vi.fn()}
        storageKeyData={storageKeyData}
      />
    );

    await waitFor(() => {
      expect(getByText('Newark', { exact: false })).toBeInTheDocument();
      expect(getByText('alpha.test.com', { exact: false })).toBeInTheDocument();
      expect(getByText(/\+ 1 region/, { exact: false })).toBeInTheDocument();
      expect(getByText('Show All', { exact: false })).toBeInTheDocument();
    });
  });
});
