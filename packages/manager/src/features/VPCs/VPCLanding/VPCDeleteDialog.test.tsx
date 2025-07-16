import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { vpcFactory } from 'src/factories';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { VPCDeleteDialog } from './VPCDeleteDialog';

describe('VPC Delete Dialog', () => {
  const props = {
    isFetching: false,
    onClose: vi.fn(),
    open: true,
    vpc: vpcFactory.build({ label: 'vpc-1' }),
    vpcError: null,
  };

  it('renders a VPC delete dialog correctly', async () => {
    const view = await renderWithThemeAndRouter(<VPCDeleteDialog {...props} />);
    const vpcTitle = view.getByText('Delete VPC vpc-1');
    expect(vpcTitle).toBeVisible();

    const cancelButton = view.getByText('Cancel');
    expect(cancelButton).toBeVisible();

    const deleteButton = view.getByText('Delete');
    expect(deleteButton).toBeVisible();
  });

  it('closes the VPC delete dialog as expected', async () => {
    const view = await renderWithThemeAndRouter(<VPCDeleteDialog {...props} />);
    const cancelButton = view.getByText('Cancel');
    expect(cancelButton).toBeVisible();
    await userEvent.click(cancelButton);
    expect(props.onClose).toBeCalled();
  });
});
