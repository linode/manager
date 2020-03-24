import { cleanup, fireEvent, wait } from '@testing-library/react';
import { SupportTicket } from 'linode-js-sdk/lib/account';
import * as React from 'react';
import { getVersionString } from 'src/utilities/getVersionString';
import { renderWithTheme } from 'src/utilities/testHelpers';
import SupportTicketDrawer, { Props } from './SupportTicketDrawer';

const support = require.requireMock('linode-js-sdk/lib/support');

const supportTicket: SupportTicket = {
  updated_by: 'test-account',
  closed: null,
  attachments: [],
  summary: 'TEST Support Ticket',
  gravatar_id: '0',
  closable: false,
  id: 0,
  status: 'new',
  description: 'TEST support ticket body',
  opened_by: 'test-account',
  entity: null,
  opened: '2018-11-01T01:00:00',
  updated: '2018-11-01T01:00:00',
  gravatarUrl: 'not found'
};

const props: Props = {
  open: true,
  onClose: jest.fn(),
  onSuccess: jest.fn()
};

// Mock support services library
jest.mock('linode-js-sdk/lib/support', () => ({
  createSupportTicket: jest.fn().mockResolvedValue(supportTicket)
}));

support.createSupportTicket = jest.fn().mockResolvedValue(supportTicket);

// Mock React-Select
jest.mock('src/components/EnhancedSelect/Select');

// Mock getVersionsString utility function
jest.mock('src/utilities/getVersionString', () => ({
  getVersionString: jest.fn()
}));

// So TypeScript won't complain...
const mockedGetVersionString = getVersionString as jest.Mock<string, any>;

afterEach(cleanup);

describe('Support Ticket Drawer', () => {
  it('should render', () => {
    const { getByText } = renderWithTheme(<SupportTicketDrawer {...props} />);
    expect(getByText('Open a Support Ticket'));
  });

  it('it should append version string if it is defined', async () => {
    // We'll mock that process.env.VERSION is equal to 0.00.0
    mockedGetVersionString.mockImplementation(
      () => 'Cloud Manager Version: 0.00.0'
    );
    const { getByText } = renderWithTheme(
      <SupportTicketDrawer
        {...props}
        prefilledDescription="hello world"
        prefilledTitle="A ticket"
      />
    );

    const submit = getByText(/open ticket/i);
    await wait(() => fireEvent.click(submit));

    expect(support.createSupportTicket).toBeCalledWith(
      expect.objectContaining({
        description: 'hello world\n\nCloud Manager Version: 0.00.0'
      })
    );
  });

  it('it should not append version string if it is not defined', async () => {
    // We'll mock that process.env.VERSION is undefined. In this case,
    // the utility function would return an empty string
    mockedGetVersionString.mockImplementation(() => '');
    const { getByText } = renderWithTheme(
      <SupportTicketDrawer
        {...props}
        prefilledDescription="hello world"
        prefilledTitle="A ticket"
      />
    );

    const submit = getByText(/open ticket/i);
    await wait(() => fireEvent.click(submit));

    expect(support.createSupportTicket).toBeCalledWith(
      expect.objectContaining({
        description: 'hello world'
      })
    );
  });
});
