import * as React from 'react';

import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { SupportTicketDialog } from './SupportTicketDialog';

import type { SupportTicketDialogProps } from './SupportTicketDialog';

const props: SupportTicketDialogProps = {
  onClose: vi.fn(),
  onSuccess: vi.fn(),
  open: true,
};

describe('Support Ticket Drawer', () => {
  it('should render', async () => {
    const { getByText } = await renderWithThemeAndRouter(
      <SupportTicketDialog {...props} />
    );
    expect(getByText('Open a Support Ticket'));
  });
});
