import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeInterfaceActionMenu } from './LinodeInterfaceActionMenu';

import type { InterfaceActionHandlers } from './LinodeInterfaceActionMenu';

const handlers: InterfaceActionHandlers = {
  onDelete: vi.fn(),
  onEdit: vi.fn(),
  onShowDetails: vi.fn(),
};

describe('LinodeInterfaceActionMenu', () => {
  it('hides the Edit option and disabled delete option for RDMA - VPC interfaces', async () => {
    const { getByLabelText, getByRole, queryByText } = renderWithTheme(
      <LinodeInterfaceActionMenu
        handlers={handlers}
        id={1}
        linodeId={1}
        type="RDMA - VPC"
      />
    );

    await userEvent.click(getByLabelText(/Action menu for RDMA - VPC/i));

    expect(queryByText('Details')).toBeVisible();
    expect(queryByText('Edit')).not.toBeInTheDocument();
    expect(getByRole('menuitem', { name: 'Delete' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('shows the Edit and Delete options for non-RDMA interfaces', async () => {
    const { getByLabelText, queryByText } = renderWithTheme(
      <LinodeInterfaceActionMenu
        handlers={handlers}
        id={1}
        linodeId={1}
        type="Public"
      />
    );

    await userEvent.click(getByLabelText(/Action menu for Public/i));

    expect(queryByText('Details')).toBeVisible();
    expect(queryByText('Edit')).toBeVisible();
    expect(queryByText('Delete')).toBeVisible();
  });
});
