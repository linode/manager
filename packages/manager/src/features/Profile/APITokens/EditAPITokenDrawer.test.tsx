import { act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { appTokenFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { EditAPITokenDrawer } from './EditAPITokenDrawer';

const props = {
  onClose: vi.fn(),
  open: true,
  token: appTokenFactory.build({ label: 'my-token' }),
};

describe('Edit API Token Drawer', () => {
  it('Should render a title, input for token label, and action buttons', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <EditAPITokenDrawer {...props} />
    );
    const drawerTitle = getByText('Edit Personal Access Token');
    expect(drawerTitle).toBeVisible();

    const labelTitle = getByText(/Label/);
    const labelField = getByTestId('textfield-input');
    expect(labelTitle).toBeVisible();
    expect(labelField).toBeEnabled();

    const saveButton = getByTestId('save-button');
    expect(saveButton).toBeVisible();

    const cancelBtn = getByText(/Cancel/);
    expect(cancelBtn).toBeEnabled();
    expect(cancelBtn).toBeVisible();
  });
  it('Save button should become enabled when label is changed', async () => {
    const { getByTestId } = renderWithTheme(<EditAPITokenDrawer {...props} />);

    const saveButton = getByTestId('save-button');
    expect(saveButton).toBeDisabled();

    await act(async () => {
      const labelField = getByTestId('textfield-input');

      userEvent.type(labelField, 'updated-token-label');

      const saveButton = getByTestId('save-button');

      await waitFor(() => expect(saveButton).toBeEnabled());
    });
  });
  it('Should close when updating a label and saving', async () => {
    // @note: this test uses handlers for PUT */profile/tokens/:id in serverHandlers.ts
    const { getByTestId } = renderWithTheme(<EditAPITokenDrawer {...props} />);

    await act(async () => {
      const labelField = getByTestId('textfield-input');

      userEvent.type(labelField, 'my-token-updated');

      const saveButton = getByTestId('save-button');

      await waitFor(() => expect(saveButton).toBeEnabled());

      userEvent.click(saveButton);

      await waitFor(() => expect(props.onClose).toBeCalled());
    });
  });
  it('Should close when Cancel is pressed', () => {
    const { getByText } = renderWithTheme(<EditAPITokenDrawer {...props} />);
    const cancelButton = getByText(/Cancel/);
    userEvent.click(cancelButton);
    expect(props.onClose).toBeCalled();
  });
});
