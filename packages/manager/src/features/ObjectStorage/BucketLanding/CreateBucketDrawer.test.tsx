import { regionFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import {
  accountSettingsFactory,
  objectStorageClusterFactory,
} from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateBucketDrawer } from './CreateBucketDrawer';

const props = {
  isOpen: true,
  onClose: vi.fn(),
};

describe('CreateBucketDrawer', () => {
  it.skip('Should show a general error notice if the API returns one', async () => {
    server.use(
      http.post('*/object-storage/buckets', () => {
        return HttpResponse.json(
          { errors: [{ reason: 'Object Storage is offline!' }] },
          {
            status: 500,
          }
        );
      }),
      http.get('*/regions', async () => {
        return HttpResponse.json(
          makeResourcePage(
            regionFactory.buildList(1, { id: 'us-east', label: 'Newark, NJ' })
          )
        );
      }),
      http.get('*object-storage/clusters', () => {
        return HttpResponse.json(
          makeResourcePage(
            objectStorageClusterFactory.buildList(1, {
              id: 'us-east-1',
              region: 'us-east',
            })
          )
        );
      }),
      http.get('*/account/settings', () => {
        return HttpResponse.json(
          accountSettingsFactory.build({ object_storage: 'active' })
        );
      })
    );

    const { findByText, getByLabelText, getByPlaceholderText, getByTestId } =
      renderWithTheme(<CreateBucketDrawer {...props} />);

    await userEvent.type(
      getByLabelText('Label', { exact: false }),
      'my-test-bucket'
    );

    // We must waitFor because we need to load region and cluster data from the API
    await waitFor(() =>
      userEvent.selectOptions(
        getByPlaceholderText('Select a Region'),
        'Newark, NJ (us-east-1)'
      )
    );

    const saveButton = getByTestId('create-bucket-button');

    await userEvent.click(saveButton);

    await findByText('Object Storage is offline!');
  });
});
