import * as React from 'react';
import { CreateBucketDrawer } from './CreateBucketDrawer';
import { act, waitFor } from '@testing-library/react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import userEvent from '@testing-library/user-event';
import { rest, server } from 'src/mocks/testServer';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import {
  accountSettingsFactory,
  objectStorageClusterFactory,
  regionFactory,
} from 'src/factories';

const props = {
  isOpen: true,
  onClose: jest.fn(),
};

jest.mock('src/components/EnhancedSelect/Select');

describe('CreateBucketDrawer', () => {
  it('Should show a general error notice if the API returns one', async () => {
    server.use(
      rest.post('*/object-storage/buckets', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ errors: [{ reason: 'omg' }] }));
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
                region: 'us-east',
                id: 'us-east-1',
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
      getByTestId,
      getByLabelText,
      getByPlaceholderText,
      findByText,
    } = renderWithTheme(<CreateBucketDrawer {...props} />);

    userEvent.type(getByLabelText('Label'), 'my-test-bucket');

    await waitFor(() =>
      userEvent.selectOptions(
        getByPlaceholderText('Select a Region'),
        'Newark, NJ (us-east-1)'
      )
    );

    const saveButton = getByTestId('create-bucket-button');

    await act(async () => {
      userEvent.click(saveButton);

      await findByText('omg');
    });
  });
});
