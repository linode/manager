import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { SubnetCreateDrawer } from './SubnetCreateDrawer';

const props = {
  onClose: vi.fn(),
  open: true,
  vpcId: 1,
};

describe('Create Subnet Drawer', () => {
  it('should render title, label, ipv4 input, ipv4 availability, and action buttons', () => {
    const { getByRole, getByTestId, getByText } = renderWithTheme(
      <SubnetCreateDrawer {...props} />
    );

    const createHeading = getByRole('heading', { name: 'Create Subnet' });
    expect(createHeading).toBeVisible();
    const createButton = getByRole('button', { name: 'Create Subnet' });
    expect(createButton).toBeVisible();
    expect(createButton).toBeDisabled();

    const label = getByText('Subnet Label');
    expect(label).toBeVisible();
    expect(label).toBeEnabled();

    const ipv4Input = getByText('Subnet IP Address Range');
    expect(ipv4Input).toBeVisible();
    expect(ipv4Input).toBeEnabled();

    const saveButton = getByTestId('create-subnet-drawer-button');
    expect(saveButton).toBeVisible();

    const cancelBtn = getByText(/Cancel/);
    expect(cancelBtn).not.toHaveAttribute('aria-disabled', 'true');
    expect(cancelBtn).toBeVisible();
  });

  it('should close the drawer if the close cancel button is clicked', async () => {
    const { getByText } = renderWithTheme(<SubnetCreateDrawer {...props} />);

    const cancelBtn = getByText(/Cancel/);
    expect(cancelBtn).not.toHaveAttribute('aria-disabled', 'true');
    expect(cancelBtn).toBeVisible();

    await userEvent.click(cancelBtn);
    expect(props.onClose).toHaveBeenCalled();
  });
});
