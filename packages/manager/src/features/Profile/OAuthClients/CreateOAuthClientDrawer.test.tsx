import { act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { oauthClientFactory } from 'src/factories/accountOAuth';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateOAuthClientDrawer } from './CreateOAuthClientDrawer';

const props = {
  onClose: vi.fn(),
  open: true,
  showSecret: vi.fn(),
};

describe('Create API Token Drawer', () => {
  it('checks for basic items', () => {
    const { getByText } = renderWithTheme(
      <CreateOAuthClientDrawer {...props} />
    );

    getByText('Create OAuth App');
    getByText('Label');
    getByText('Callback URL');
    getByText('Create');
    getByText('Cancel');
  });
  it('Should show client side validation errors', async () => {
    const { getByText } = renderWithTheme(
      <CreateOAuthClientDrawer {...props} />
    );

    const submit = getByText('Create');

    act(() => {
      userEvent.click(submit);
    });

    await waitFor(() => expect(getByText('Label is required.')).toBeVisible());
  });
  it('Should see secret modal with secret when you type a label and callback url then submit the form successfully', async () => {
    server.use(
      rest.post('*/account/oauth-clients', (req, res, ctx) => {
        return res(
          ctx.json({
            ...oauthClientFactory.build(),
            secret: 'omg!',
          })
        );
      })
    );

    const { getAllByTestId, getByText } = renderWithTheme(
      <CreateOAuthClientDrawer {...props} />
    );

    const textFields = getAllByTestId('textfield-input');

    const labelField = textFields[0];
    const callbackUrlField = textFields[1];

    const submit = getByText('Create');

    act(() => {
      userEvent.type(labelField, 'my-oauth-client');
      userEvent.type(callbackUrlField, 'http://localhost:3000');
      userEvent.click(submit);
    });

    await waitFor(() => expect(props.showSecret).toBeCalledWith('omg!'));
  });
  it('Should close when Cancel is pressed', () => {
    const { getByText } = renderWithTheme(
      <CreateOAuthClientDrawer {...props} />
    );
    const cancelButton = getByText('Cancel');
    userEvent.click(cancelButton);
    expect(props.onClose).toBeCalled();
  });
});
