import * as React from 'react';

import { vpcFactory } from 'src/factories/vpcs';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { VPCEditDrawer } from './VPCEditDrawer';

const queryMocks = vi.hoisted(() => ({
  useVPCsQuery: vi.fn().mockReturnValue({}),
  userPermissions: vi.fn(() => ({
    data: {
      update_vpc: true,
    },
  })),
}));
vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));
describe('Edit VPC Drawer', () => {
  const props = {
    isFetching: false,
    onClose: vi.fn(),
    open: true,
    vpc: vpcFactory.build(),
    vpcError: null,
  };

  it('Should render a title, label input, description input, and action buttons', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <VPCEditDrawer {...props} />
    );
    const drawerTitle = getByText('Edit VPC');
    expect(drawerTitle).toBeVisible();

    const label = getByText('Label');
    const labelInput = getByTestId('label');
    expect(label).toBeVisible();
    expect(labelInput).toBeEnabled();

    const description = getByText('Description');
    const descriptionInput = getByTestId('description');
    expect(description).toBeVisible();
    expect(descriptionInput).toBeEnabled();

    const saveButton = getByTestId('save-button');
    expect(saveButton).toBeVisible();

    const cancelBtn = getByText(/Cancel/);
    expect(cancelBtn).not.toHaveAttribute('aria-disabled', 'true');
    expect(cancelBtn).toBeVisible();
  });

  it('Should disable the Label and Description inputs when user does not have "update_vpc" permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_vpc: false,
      },
    });
    const { getByLabelText } = renderWithTheme(<VPCEditDrawer {...props} />);

    const labelInput = getByLabelText('Label');
    expect(labelInput).toHaveAttribute('disabled');

    const descriptionInput = getByLabelText('Description');
    expect(descriptionInput).toHaveAttribute('disabled');
  });

  it('Should enable the Label and Description inputs when user has "update_vpc" permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_vpc: true,
      },
    });
    const { getByLabelText } = renderWithTheme(<VPCEditDrawer {...props} />);

    const labelInput = getByLabelText('Label');
    expect(labelInput).not.toHaveAttribute('disabled');

    const descriptionInput = getByLabelText('Description');
    expect(descriptionInput).not.toHaveAttribute('disabled');
  });
});
