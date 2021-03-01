import { fireEvent, within } from '@testing-library/react';
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
});
