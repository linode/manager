import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { SubnetCreateDrawer } from './SubnetCreateDrawer';
import { fireEvent } from '@testing-library/react';

const props = {
  onClose: jest.fn(),
  open: true,
  vpcId: 1,
};

describe('Create Subnet Drawer', () => {
  it('should render title, label, ipv4 input, ipv4 availability, and action buttons', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <SubnetCreateDrawer {...props} />
    );

    const drawerTitle = getByText('Create Subnet');
    expect(drawerTitle).toBeVisible();

    const label = getByText('Subnet label');
    expect(label).toBeVisible();
    expect(label).toBeEnabled();

    const ipv4Input = getByText('Subnet IP Address Range');
    expect(ipv4Input).toBeVisible();
    expect(ipv4Input).toBeEnabled();

    const saveButton = getByTestId('create-subnet-button');
    expect(saveButton).toBeVisible();

    const cancelBtn = getByText(/Cancel/);
    expect(cancelBtn).toBeEnabled();
    expect(cancelBtn).toBeVisible();
  });

  it('should close the drawer if the close cancel button is clicked', () => {
    const { getByText } = renderWithTheme(<SubnetCreateDrawer {...props} />);

    const cancelBtn = getByText(/Cancel/);
    expect(cancelBtn).toBeEnabled();
    expect(cancelBtn).toBeVisible();

    fireEvent.click(cancelBtn);
    expect(props.onClose).toHaveBeenCalled();
  });
});
