import { AxiosRequestConfig } from 'axios';
import { shallow } from 'enzyme';
import * as React from 'react';

import { API_ROOT } from 'src/constants';

import CloseTicketLink from './CloseTicketLink';

const mockFn = jest.fn(() => Promise.resolve());
const success = jest.fn();
const ticketId = 12345;

// mockFn
//   .mockReturnValueOnce(Promise.resolve({'data':'none'}))
//   .mockReturnValueOnce(Promise.reject({'errors':[{'reason':'some reason'}]}))
//   .mockReturnValue(Promise.resolve({'data':'none'}))

jest.mock('axios', () => ({
  default: (config:AxiosRequestConfig) => mockFn(config),
}));

const component = shallow(
  <CloseTicketLink
    ticketId={ticketId}
    closeTicketSuccess={success}
  />
)

const rawComponent = new CloseTicketLink({
  ticketId,
  closeTicketSuccess: success
})

describe("Ticket reply panel", () => {
  it("should display a link to close a ticket", () => {
    const link = component.find('[data-qa-close-ticket-link]')
    expect(link).toHaveLength(1);
    expect(link.text()).toBe('close this ticket');
  })

  it("should open a dropdown when the link is clicked", () => {
    expect(component.state().dialogOpen).toBe(false);
    component.find('[data-qa-close-ticket-link]').simulate('click', {target: {name: 0}});
    expect(component.state().dialogOpen).toBe(true);
  });

  it("closeTicket should call tickets/ID/close", () => {
    rawComponent.closeTicket();
    expect(mockFn).toHaveBeenCalledWith({
      method: 'POST',
      url: `${API_ROOT}/support/tickets/${ticketId}/close`,
    });
  });

  it("should display an error message if the request fails", () => {
    component.setState({ ticketCloseError: 'This is an error.' });
    expect(component.find('[data-qa-confirmation-error]')).toHaveLength(1);
  });
});