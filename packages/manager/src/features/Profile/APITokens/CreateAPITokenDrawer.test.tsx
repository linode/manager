import * as React from 'react';
import { CreateAPITokenDrawer } from './CreateAPITokenDrawer';
import { act, waitFor, within } from '@testing-library/react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { rest, server } from 'src/mocks/testServer';
import { appTokenFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import userEvent from '@testing-library/user-event';

const props = {
  open: true,
  onClose: jest.fn(),
  showSecret: jest.fn(),
};

describe('API Token Drawer', () => {
  it('checks API Token Drawer rendering', () => {
    const { getByText, getByTestId } = renderWithTheme(
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

    const submitBtn = getByText(/Create Token/);
    expect(submitBtn).toBeVisible();
    expect(submitBtn).toBeEnabled();

    const cancelBtn = getByText(/Cancel/);
    expect(cancelBtn).toBeEnabled();
    expect(cancelBtn).toBeVisible();
  });
  it('changes scope permissions to read/write', async () => {
    server.use(
      rest.post('*/profile/tokens', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage(appTokenFactory.buildList(1))));
      })
    );

    const { getByTestId, getByText } = renderWithTheme(
      <CreateAPITokenDrawer {...props} />
    );

    await act(async () => {
      const selectAllBtn = within(getByTestId('set-all-write')).getByRole(
        'radio'
      );

      userEvent.click(selectAllBtn);

      const labelField = getByTestId('textfield-input');

      userEvent.type(labelField, 'test-token');

      const submit = getByText('Create Token');

      userEvent.click(submit);

      await waitFor(() => expect(props.showSecret).toBeCalled());
    });
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
  it('Should default to never for expiration', () => {
    const { getByText } = renderWithTheme(<CreateAPITokenDrawer {...props} />);
    getByText('In 6 months');
  });
});
