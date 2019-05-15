import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';
import { supportTicket } from 'src/__data__/supportTicket';
import { createSupportTicket } from 'src/services/support';
import { getVersionString } from 'src/utilities/getVersionString';
import {
  CombinedProps,
  State,
  SupportTicketDrawer
} from './SupportTicketDrawer';

// Mock support services library
jest.mock('src/services/support', () => ({
  createSupportTicket: jest.fn().mockResolvedValue(supportTicket)
}));

// Mock getVersionsString utility function
jest.mock('src/utilities/getVersionString', () => ({
  getVersionString: jest.fn()
}));

// So TypeScript won't complain...
const mockedGetVersionString = getVersionString as jest.Mock<
  typeof getVersionString
>;

let wrapper: ShallowWrapper<CombinedProps, State, SupportTicketDrawer>;

beforeEach(() => {
  wrapper = shallow<SupportTicketDrawer>(
    <SupportTicketDrawer
      classes={{
        root: '',
        suffix: '',
        actionPanel: '',
        innerReply: '',
        rootReply: '',
        reference: ''
      }}
      open={true}
      onClose={jest.fn()}
      onSuccess={jest.fn()}
    />
  );
});

describe('Support Ticket Drawer', () => {
  it('should render', () => {
    expect(wrapper).toBeDefined();
  });

  it('it should append version string if it is defined', () => {
    // We'll mock that process.env.VERSION is equal to 0.00.0
    mockedGetVersionString.mockImplementation(
      () => 'Cloud Manager Version: 0.00.0'
    );

    // The user has typed "hello world" in the description
    wrapper.setState({
      ticket: { ...wrapper.state().ticket, description: 'hello world' }
    });

    // Simulate pressing "Open Ticket"
    const button = wrapper.find('[data-qa-submit]');
    button.simulate('click');

    // We'd expect the version string to be appended to the description
    expect(createSupportTicket).toBeCalledWith(
      expect.objectContaining({
        description: 'hello world\n\nCloud Manager Version: 0.00.0'
      })
    );
  });

  it('it should not append version string if it is not defined', () => {
    // We'll mock that process.env.VERSION is undefined. In this case,
    // the utility function would return an empty string
    mockedGetVersionString.mockImplementation(() => '');

    // The user has typed "hello world" in the description
    wrapper.setState({
      ticket: { ...wrapper.state().ticket, description: 'hello world' }
    });

    // Simulate pressing "Open Ticket"
    const button = wrapper.find('[data-qa-submit]');
    button.simulate('click');

    // We would not expect to find anything appended to the description
    expect(createSupportTicket).toBeCalledWith(
      expect.objectContaining({
        description: 'hello world'
      })
    );
  });
});
