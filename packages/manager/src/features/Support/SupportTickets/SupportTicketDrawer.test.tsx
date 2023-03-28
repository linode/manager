import { vi } from 'vitest';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import SupportTicketDrawer, { Props } from './SupportTicketDrawer';

const props: Props = {
  open: true,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
};

// Mock React-Select
vi.mock('src/components/EnhancedSelect/Select');

describe('Support Ticket Drawer', () => {
  it('should render', () => {
    const { getByText } = renderWithTheme(<SupportTicketDrawer {...props} />);
    expect(getByText('Open a Support Ticket'));
  });
});
