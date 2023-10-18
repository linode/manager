import { act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { appTokenFactory } from 'src/factories';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateAPITokenDrawer } from './CreateAPITokenDrawer';

const props = {
  onClose: vi.fn(),
  open: true,
  showSecret: vi.fn(),
};

describe('Create API Token Drawer', () => {
  it('checks API Token Drawer rendering', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <CreateAPITokenDrawer {...props} />
    );
    const drawerTitle = getByText('Add Personal Access Token');
    expect(drawerTitle).toBeVisible();

    const labelTitle = getByText(/Label/);
    const labelField = getByTestId('textfield-input');
    expect(labelTitle).toBeVisible();
    expect(labelField).toBeEnabled();

    const expiry = getByText(/Expiry/);
    expect(expiry).toBeVisible();

    const submitBtn = getByTestId('create-button');
    expect(submitBtn).toBeVisible();
    expect(submitBtn).toBeEnabled();

    const cancelBtn = getByText(/Cancel/);
    expect(cancelBtn).toBeEnabled();
    expect(cancelBtn).toBeVisible();
  });
  it('Should see secret modal with secret when you type a label and submit the form successfully', async () => {
    server.use(
      rest.post('*/profile/tokens', (req, res, ctx) => {
        return res(ctx.json(appTokenFactory.build({ token: 'secret-value' })));
      })
    );

    const { getByTestId, getByText } = renderWithTheme(
      <CreateAPITokenDrawer {...props} />
    );

    const labelField = getByTestId('textfield-input');
    const submit = getByText('Create Token');

    act(() => {
      userEvent.type(labelField, 'my-test-token');
      userEvent.click(submit);
    });

    await waitFor(() =>
      expect(props.showSecret).toBeCalledWith('secret-value')
    );
  });
  it('Should default to read/write for all scopes', () => {
    const { getByLabelText } = renderWithTheme(
      <CreateAPITokenDrawer {...props} />
    );
    const selectAllReadWriteRadioButton = getByLabelText(
      'Select read/write for all'
    );
    expect(selectAllReadWriteRadioButton).toBeChecked();
  });
  it('Should default to 6 months for expiration', () => {
    const { getByText } = renderWithTheme(<CreateAPITokenDrawer {...props} />);
    getByText('In 6 months');
  });
  it('Should close when Cancel is pressed', () => {
    const { getByText } = renderWithTheme(<CreateAPITokenDrawer {...props} />);
    const cancelButton = getByText(/Cancel/);
    userEvent.click(cancelButton);
    expect(props.onClose).toBeCalled();
  });
});
