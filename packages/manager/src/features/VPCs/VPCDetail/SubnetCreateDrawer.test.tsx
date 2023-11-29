import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { SubnetCreateDrawer } from './SubnetCreateDrawer';
import { fireEvent } from '@testing-library/react';

const props = {
  onClose: vi.fn(),
  open: true,
  vpcId: 1,
};

describe('Create Subnet Drawer', () => {
  it('should render title, label, ipv4 input, ipv4 availability, and action buttons', () => {
    const { getByTestId, getAllByText, getByText } = renderWithTheme(
      <SubnetCreateDrawer {...props} />
    );

    const createSubnetTexts = getAllByText('Create Subnet');
    expect(createSubnetTexts).toHaveLength(2);

    expect(createSubnetTexts[0]).toBeVisible(); // the Drawer title
    expect(createSubnetTexts[1]).toBeVisible(); // the button

    const label = getByText('Subnet Label');
    expect(label).toBeVisible();
    expect(label).toBeEnabled();

    const ipv4Input = getByText('Subnet IP Address Range');
    expect(ipv4Input).toBeVisible();
    expect(ipv4Input).toBeEnabled();

    const saveButton = getByTestId('create-subnet-drawer-button');
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
