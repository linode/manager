import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { SubnetEditDrawer } from './SubnetEditDrawer';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      update_vpc: true,
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
describe('SubnetEditDrawer', () => {
  const props = {
    isFetching: false,
    onClose: vi.fn(),
    open: true,
    vpcId: 1,
  };

  it('Should render a title, label input, ip address input, and action buttons', () => {
    const { getByTestId, getByRole, getByText } = renderWithTheme(
      <SubnetEditDrawer {...props} />
    );
    const drawerTitle = getByText('Edit Subnet');
    expect(drawerTitle).toBeVisible();

    const label = getByText('Label');
    const labelInput = getByRole('textbox', { name: 'Label' });
    expect(label).toBeVisible();
    expect(labelInput).toBeEnabled();

    const ip = getByText('Subnet IP Address Range');
    const ipInput = getByRole('textbox', { name: 'Subnet IP Address Range' });
    expect(ip).toBeVisible();
    expect(ipInput).toBeDisabled();

    const saveButton = getByTestId('save-button');
    expect(saveButton).toBeVisible();

    const cancelBtn = getByText(/Cancel/);
    expect(cancelBtn).not.toHaveAttribute('aria-disabled', 'true');
    expect(cancelBtn).toBeVisible();
  });

  it('should disable the Label input when user does not have update_vpc permission', () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_vpc: false,
      },
    });
    const { getByRole } = renderWithTheme(<SubnetEditDrawer {...props} />);
    const labelInput = getByRole('textbox', { name: 'Label' });
    expect(labelInput).toBeDisabled();
  });

  it('should enable the Label input when user does not have update_vpc permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_vpc: true,
      },
    });
    const { getByRole, getByTestId } = renderWithTheme(
      <SubnetEditDrawer {...props} />
    );
    const labelInput = getByRole('textbox', { name: 'Label' });
    expect(labelInput).toBeEnabled();

    await userEvent.type(labelInput, 'New label');
    const saveButton = getByTestId('save-button');
    expect(saveButton).toHaveAttribute('aria-disabled', 'false');
  });
});
