import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { SubnetEditDrawer } from './SubnetEditDrawer';

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
});
