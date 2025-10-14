import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AddLinodeDrawer } from './AddLinodeDrawer';

const helperText = 'helper text';
const onClose = vi.fn();

const props = {
  helperText,
  onClose,
  open: true,
  disabled: true,
};

const queryMocks = vi.hoisted(() => ({
  useParams: vi.fn().mockReturnValue({}),
  useQueryWithPermissions: vi.fn().mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  useQueryWithPermissions: queryMocks.useQueryWithPermissions,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

describe('AddLinodeDrawer', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({ id: '1' });
  });

  it('should contain helper text', () => {
    const { getByText } = renderWithTheme(<AddLinodeDrawer {...props} />);
    expect(getByText(helperText)).toBeInTheDocument();
  });

  it('should contain a Linodes label', () => {
    const { getByText } = renderWithTheme(<AddLinodeDrawer {...props} />);
    expect(getByText('Linodes')).toBeInTheDocument();
  });

  it('should contain a Linodes input dropdown', () => {
    const { getByTestId } = renderWithTheme(<AddLinodeDrawer {...props} />);
    expect(getByTestId('add-linode-autocomplete')).toBeInTheDocument();
  });

  it('should contain an Add button', () => {
    const { getByText } = renderWithTheme(<AddLinodeDrawer {...props} />);
    expect(getByText('Add')).toBeInTheDocument();
  });

  it('should disable "Add" button if the user does not have create_firewall_device permission', async () => {
    const { getByRole } = renderWithTheme(<AddLinodeDrawer {...props} />);

    const select = getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select).toBeDisabled();

    const addButton = getByRole('button', {
      name: 'Add',
    });
    expect(addButton).toBeInTheDocument();
    expect(addButton).toBeDisabled();
  });

  it('should enable "Add" button if the user has create_firewall_device permission', async () => {
    const { getByRole } = renderWithTheme(
      <AddLinodeDrawer {...props} disabled={false} />
    );

    const select = getByRole('combobox');
    expect(select).toBeInTheDocument();

    await waitFor(() => {
      expect(select).toBeEnabled();
    });
  });
});
