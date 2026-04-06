import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { vpcFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { VPCDeleteDialog } from './VPCDeleteDialog';

const queryMocks = vi.hoisted(() => ({
  useVPCsQuery: vi.fn().mockReturnValue({}),
  userPermissions: vi.fn(() => ({
    data: {
      delete_vpc: true,
    },
  })),
}));
vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

describe('VPC Delete Dialog', () => {
  const props = {
    isFetching: false,
    onClose: vi.fn(),
    open: true,
    vpc: vpcFactory.build({ label: 'vpc-1' }),
    vpcError: null,
  };

  it('renders a VPC delete dialog correctly', async () => {
    const view = renderWithTheme(<VPCDeleteDialog {...props} />);
    const vpcTitle = view.getByText('Delete VPC vpc-1');
    expect(vpcTitle).toBeVisible();

    const cancelButton = view.getByText('Cancel');
    expect(cancelButton).toBeVisible();

    const deleteButton = view.getByText('Delete');
    expect(deleteButton).toBeVisible();
  });

  it('closes the VPC delete dialog as expected', async () => {
    const view = renderWithTheme(<VPCDeleteDialog {...props} />);
    const cancelButton = view.getByText('Cancel');
    expect(cancelButton).toBeVisible();
    await userEvent.click(cancelButton);
    expect(props.onClose).toBeCalled();
  });

  it('disables the VPC Label input when user does not have "delete_vpc" permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        delete_vpc: false,
      },
    });
    const view = renderWithTheme(<VPCDeleteDialog {...props} />);
    const vpcLabelInput = await view.findByLabelText('VPC Label');
    expect(vpcLabelInput).toBeDisabled();
  });

  it('enables the VPC Label input when user has "delete_vpc" permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        delete_vpc: true,
      },
    });
    const view = renderWithTheme(<VPCDeleteDialog {...props} />);
    const vpcLabelInput = await view.findByLabelText('VPC Label');
    expect(vpcLabelInput).not.toBeDisabled();
  });
});
