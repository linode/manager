import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { SubnetEditDrawer } from './SubnetEditDrawer';

describe('SubnetEditDrawer', () => {
  const props = {
    onClose: vi.fn(),
    open: true,
    vpcId: 1,
  };

  it('Should render a title, label input, ip address input, and action buttons', () => {
    const { getAllByTestId, getByTestId, getByText } = renderWithTheme(
      <SubnetEditDrawer {...props} />
    );
    const drawerTitle = getByText('Edit Subnet');
    expect(drawerTitle).toBeVisible();

    const inputs = getAllByTestId('textfield-input');

    const label = getByText('Label');
    const labelInput = inputs[0];
    expect(label).toBeVisible();
    expect(labelInput).toBeEnabled();

    const ip = getByText('Subnet IP Address Range');
    const ipInput = inputs[1];
    expect(ip).toBeVisible();
    expect(ipInput).not.toBeEnabled();

    const saveButton = getByTestId('save-button');
    expect(saveButton).toBeVisible();

    const cancelBtn = getByText(/Cancel/);
    expect(cancelBtn).not.toHaveAttribute('aria-disabled', 'true');
    expect(cancelBtn).toBeVisible();
  });
});
