import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  SupportTicketDialog,
  SupportTicketDialogProps,
} from './SupportTicketDialog';

const props: SupportTicketDialogProps = {
  onClose: vi.fn(),
  onSuccess: vi.fn(),
  open: true,
};

// Mock React-Select
vi.mock('src/components/EnhancedSelect/Select');

describe('Support Ticket Drawer', () => {
  it('should render', () => {
    const { getByText } = renderWithTheme(<SupportTicketDialog {...props} />);
    expect(getByText('Open a Support Ticket'));
  });
});
