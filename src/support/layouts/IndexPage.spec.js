import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';

import { IndexPage } from '~/support/layouts/IndexPage';
import { api } from '~/data';

describe('support/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    sandbox.restore();
  });

  it('should render without error', () => {
    const mockDispatch = jest.fn();
    const wrapper = shallow(
      <IndexPage
        dispatch={mockDispatch}
        tickets={api.tickets}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a list of tickets', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        tickets={api.tickets}
      />
    );

    const tickets = page.find('.TableRow');
    expect(tickets.length).toBe(Object.keys(api.tickets.tickets).length);
    const ticket = tickets.at(0);

    // Get id without hashtag
    const id = ticket.find('td').at(1).text()
      .substring('Ticket #'.length);
    const renderedTicket = api.tickets.tickets[id];
    const label = ticket.find('Link').at(0);
    expect(label.props().to).toBe(`/support/${id}`);
    expect(label.text()).toBe(renderedTicket.summary);

    expect(ticket.find(`#opened-by-${id}`).text()).toBe(renderedTicket.opened_by);
    expect(ticket.find(`#opened-${id} TimeDisplay`).props().time).toBe(renderedTicket.opened);
    expect(ticket.find(`#regarding-${id}`).text()).toBe(renderedTicket.entity.label);

    expect(ticket.find(`#updated-by-${id}`).text()).toBe(renderedTicket.updated_by);
    expect(ticket.find(`#updated-${id} TimeDisplay`).props().time).toBe(renderedTicket.updated);
  });
});
