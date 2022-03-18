import { fireEvent, within, waitFor } from '@testing-library/react';
import * as React from 'react';
import { APITokenDrawer } from './APITokenDrawer';

import { renderWithTheme } from 'src/utilities/testHelpers';
import { basePermNameMap, basePerms } from './utils';

const props = {
  classes: {
    permsTable: '',
    selectCell: '',
    accessCell: '',
    noneCell: '',
    readOnlyCell: '',
    readWritecell: '',
  },
  open: true,
  mode: 'create',
  closeDrawer: jest.fn(),
  onChange: jest.fn(),
  onCreate: jest.fn(),
  onEdit: jest.fn(),
  perms: basePerms,
  permNameMap: basePermNameMap,
};

describe('API Token Drawer', () => {
  it('checks API Token Drawer rendering', () => {
    const { getByText, getByTestId } = renderWithTheme(
      <APITokenDrawer {...props} />
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
  it('changes scope permissions to read/write', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <APITokenDrawer {...props} />
    );
    const selectAllBtn = within(getByTestId('set-all-write')).getByRole(
      'radio'
    );
    fireEvent.click(selectAllBtn);
    const submit = getByText('Create Token');
    fireEvent.click(submit);
    expect(props.onCreate).toHaveBeenCalledWith('*');
  });
  it.only('Should default to read/write for all scopes', async () => {
    const { findByLabelText } = renderWithTheme(<APITokenDrawer {...props} />);
    const selectAllReadWriteRadioButton = await findByLabelText(
      'Select read/write for all'
    );
    await waitFor(() => expect(selectAllReadWriteRadioButton).toBeChecked());
  });
  it('Should default to never for expiration', () => {
    // const { getByLabelText } = renderWithTheme(<APITokenDrawer {...props} />);
    // const experationSelection = getByLabelText('Expiry');
  });
});
