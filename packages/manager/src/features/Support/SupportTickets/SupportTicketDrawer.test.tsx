import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import SupportTicketDrawer, { Props } from './SupportTicketDrawer';

const props: Props = {
  open: true,
  onClose: jest.fn(),
  onSuccess: jest.fn()
};

// Mock React-Select
jest.mock('src/components/EnhancedSelect/Select');

describe('Support Ticket Drawer', () => {
  it('should render', () => {
    const { getByText } = renderWithTheme(<SupportTicketDrawer {...props} />);
    expect(getByText('Open a Support Ticket'));
  });
});
