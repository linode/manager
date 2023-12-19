import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { VPCDeleteDialog } from './VPCDeleteDialog';

describe('VPC Delete Dialog', () => {
  const props = {
    id: 1,
    label: 'vpc-1',
    onClose: vi.fn(),
    open: true,
  };

  it('renders a VPC delete dialog correctly', () => {
    const screen = renderWithTheme(<VPCDeleteDialog {...props} />);
    const vpcTitle = screen.getByText('Delete VPC vpc-1');
    expect(vpcTitle).toBeVisible();

    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeVisible();

    const deleteButton = screen.getByText('Delete');
    expect(deleteButton).toBeVisible();
  });
  it('closes the VPC delete dialog as expected', () => {
    const screen = renderWithTheme(<VPCDeleteDialog {...props} />);
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeVisible();
    fireEvent.click(cancelButton);
    expect(props.onClose).toBeCalled();
  });
});
