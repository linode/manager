import { cleanup, fireEvent, wait } from '@testing-library/react';
import * as React from 'react';
import { supportTicketFactory } from 'src/factories/support';
import { getVersionString } from 'src/utilities/getVersionString';
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
