import { cleanup } from '@testing-library/react';
import * as React from 'react';
import { supportTicketFactory } from 'src/factories/support';
import { renderWithTheme } from 'src/utilities/testHelpers';
import SupportTicketDrawer, { Props } from './SupportTicketDrawer';

const support = require.requireMock('@linode/api-v4/lib/support');

const props: Props = {
  open: true,
  onClose: jest.fn(),
  onSuccess: jest.fn()
};

const supportTicket = supportTicketFactory.build();

// Mock support services library
jest.mock('@linode/api-v4/lib/support', () => ({
  createSupportTicket: jest.fn().mockResolvedValue(supportTicket)
}));

support.createSupportTicket = jest.fn().mockResolvedValue(supportTicket);

// Mock React-Select
jest.mock('src/components/EnhancedSelect/Select');

afterEach(cleanup);

describe('Support Ticket Drawer', () => {
  it('should render', () => {
    const { getByText } = renderWithTheme(<SupportTicketDrawer {...props} />);
    expect(getByText('Open a Support Ticket'));
  });
});
