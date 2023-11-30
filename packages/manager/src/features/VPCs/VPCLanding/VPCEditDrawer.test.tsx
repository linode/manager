import * as React from 'react';

import { vpcFactory } from 'src/factories/vpcs';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { VPCEditDrawer } from './VPCEditDrawer';

describe('Edit VPC Drawer', () => {
  const props = {
    onClose: vi.fn(),
    open: true,
    vpc: vpcFactory.build(),
  };

  it('Should render a title, label input, description input, and action buttons', () => {
    const { getAllByTestId, getByTestId, getByText } = renderWithTheme(
      <VPCEditDrawer {...props} />
    );
    const drawerTitle = getByText('Edit VPC');
    expect(drawerTitle).toBeVisible();

    const inputs = getAllByTestId('textfield-input');

    const label = getByText('Label');
    const labelInput = inputs[0];
    expect(label).toBeVisible();
    expect(labelInput).toBeEnabled();

    const description = getByText('Description');
    const descriptionInput = inputs[1];
    expect(description).toBeVisible();
    expect(descriptionInput).toBeEnabled();

    const saveButton = getByTestId('save-button');
    expect(saveButton).toBeVisible();

    const cancelBtn = getByText(/Cancel/);
    expect(cancelBtn).toBeEnabled();
    expect(cancelBtn).toBeVisible();
  });
});
