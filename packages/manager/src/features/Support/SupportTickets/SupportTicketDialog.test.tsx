import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import {
  SupportTicketDialog,
  SupportTicketDialogProps,
} from './SupportTicketDialog';

const props: SupportTicketDialogProps = {
  open: true,
  onClose: jest.fn(),
  onSuccess: jest.fn(),
};

// Mock React-Select
jest.mock('src/components/EnhancedSelect/Select');

describe('Support Ticket Drawer', () => {
  it('should render', () => {
    const { getByText } = renderWithTheme(<SupportTicketDialog {...props} />);
    expect(getByText('Open a Support Ticket'));
  });
});
