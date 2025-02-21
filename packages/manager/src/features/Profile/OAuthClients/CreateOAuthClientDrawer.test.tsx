import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { oauthClientFactory } from 'src/factories/accountOAuth';
import { HttpResponse, http, server } from 'src/mocks/testServer';
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
  it('Should have the Public checkbox as checked by default', () => {
    const { getByRole } = renderWithTheme(
      <CreateOAuthClientDrawer {...props} />
    );

    const checkbox = getByRole('checkbox', { name: 'Public' });
    expect(checkbox).toBeChecked();
  });
  it('Should show client side validation errors', async () => {
    const { getByText } = renderWithTheme(
      <CreateOAuthClientDrawer {...props} />
    );

    const submit = getByText('Create');

    await userEvent.click(submit);

    await waitFor(() => expect(getByText('Label is required.')).toBeVisible());
  });
  it('Should see secret modal with secret when you type a label and callback url then submit the form successfully', async () => {
    server.use(
      http.post('*/account/oauth-clients', () => {
        return HttpResponse.json({
          ...oauthClientFactory.build(),
          secret: 'omg!',
        });
      })
    );

    const { getAllByTestId, getByText } = renderWithTheme(
      <CreateOAuthClientDrawer {...props} />
    );

    const textFields = getAllByTestId('textfield-input');

    const labelField = textFields[0];
    const callbackUrlField = textFields[1];

    const submit = getByText('Create');

    await userEvent.type(labelField, 'my-oauth-client');
    await userEvent.type(callbackUrlField, 'http://localhost:3000');
    await userEvent.click(submit);

    await waitFor(() => expect(props.showSecret).toBeCalledWith('omg!'));
  });
  it('Should close when Cancel is pressed', async () => {
    const { getByText } = renderWithTheme(
      <CreateOAuthClientDrawer {...props} />
    );
    const cancelButton = getByText('Cancel');
    await userEvent.click(cancelButton);
    expect(props.onClose).toBeCalled();
  });
});
