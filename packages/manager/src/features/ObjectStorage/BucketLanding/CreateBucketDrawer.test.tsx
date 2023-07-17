import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import {
  accountSettingsFactory,
  objectStorageClusterFactory,
  regionFactory,
} from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateBucketDrawer } from './CreateBucketDrawer';

const props = {
  isOpen: true,
  onClose: jest.fn(),
};

jest.mock('src/components/EnhancedSelect/Select');

describe('CreateBucketDrawer', () => {
  it('Should show a general error notice if the API returns one', async () => {
    server.use(
      rest.post('*/object-storage/buckets', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ errors: [{ reason: 'Object Storage is offline!' }] })
        );
      }),
      rest.get('*/regions', async (req, res, ctx) => {
        return res(
          ctx.json(
            makeResourcePage(
              regionFactory.buildList(1, { id: 'us-east', label: 'Newark, NJ' })
            )
          )
        );
      }),
      rest.get('*object-storage/clusters', (req, res, ctx) => {
        return res(
          ctx.json(
            makeResourcePage(
              objectStorageClusterFactory.buildList(1, {
                id: 'us-east-1',
                region: 'us-east',
              })
            )
          )
        );
      }),
      rest.get('*/account/settings', (req, res, ctx) => {
        return res(
          ctx.json(accountSettingsFactory.build({ object_storage: 'active' }))
        );
      })
    );

    const {
      findByText,
      getByLabelText,
      getByPlaceholderText,
      getByTestId,
    } = renderWithTheme(<CreateBucketDrawer {...props} />);

    userEvent.type(getByLabelText('Label'), 'my-test-bucket');

    // We must waitFor because we need to load region and cluster data from the API
    await waitFor(() =>
      userEvent.selectOptions(
        getByPlaceholderText('Select a Region'),
        'Newark, NJ (us-east-1)'
      )
    );

    const saveButton = getByTestId('create-bucket-button');

    userEvent.click(saveButton);

    await findByText('Object Storage is offline!');
  });
});
