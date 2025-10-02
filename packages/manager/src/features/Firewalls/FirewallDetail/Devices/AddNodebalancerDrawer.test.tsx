import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AddNodebalancerDrawer } from './AddNodebalancerDrawer';

const helperText = 'helper text';
const onClose = vi.fn();

const props = {
  helperText,
  onClose,
  open: true,
  disabled: false,
};

const queryMocks = vi.hoisted(() => ({
  useParams: vi.fn().mockReturnValue({}),
  userPermissions: vi.fn(() => ({
    data: {
      create_firewall_device: true,
    },
  })),
  useQueryWithPermissions: vi.fn().mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
  useQueryWithPermissions: queryMocks.useQueryWithPermissions,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

describe('AddNodeBalancerDrawer', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({ id: '1' });
  });

  it('should contain helper text', () => {
    const { getByText } = renderWithTheme(<AddNodebalancerDrawer {...props} />);
    expect(getByText(helperText)).toBeInTheDocument();
  });

  it('should contain a NodeBalancers label', () => {
    const { getByText } = renderWithTheme(<AddNodebalancerDrawer {...props} />);
    expect(getByText('NodeBalancers')).toBeInTheDocument();
  });

  it('should contain a Nodebalancer input dropdown', () => {
    const { getByTestId } = renderWithTheme(
      <AddNodebalancerDrawer {...props} />
    );
    expect(getByTestId('add-nodebalancer-autocomplete')).toBeInTheDocument();
  });

  it('should contain an Add button', () => {
    const { getByText } = renderWithTheme(<AddNodebalancerDrawer {...props} />);
    expect(getByText('Add')).toBeInTheDocument();
  });
  it('should enable select if the user has create_firewall_device permission', async () => {
    const { getByRole } = renderWithTheme(<AddNodebalancerDrawer {...props} />);

    const select = getByRole('combobox');
    expect(select).toBeInTheDocument();

    await waitFor(() => {
      expect(select).toBeEnabled();
    });
  });

  it('should disable "Add" button and select if the user does not have create_firewall_device permission', async () => {
    const { getByRole } = renderWithTheme(
      <AddNodebalancerDrawer {...props} disabled={true} />
    );

    const addButton = getByRole('button', {
      name: 'Add',
    });
    expect(addButton).toBeInTheDocument();
    expect(addButton).toBeDisabled();

    const select = getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select).toBeDisabled();
  });
});
