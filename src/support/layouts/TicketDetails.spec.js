import { mount, shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { StaticRouter } from 'react-router-dom';

import { MAX_UPLOAD_SIZE_MB } from '~/constants';
import { TicketDetails } from './TicketDetails';

import { expectRequest, expectDispatchOrStoreErrors } from '~/test.helpers';
import { testTicket, closedTicket } from '~/data/tickets';
import { createSimulatedEvent } from '../../test.helpers';


describe('support/layouts/TicketPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should render without error', () => {
    const mockDispatch = jest.fn();
    const wrapper = shallow(
      <StaticRouter>
        <TicketDetails
          ticket={testTicket}
          replies={testTicket._replies.replies}
          dispatch={mockDispatch}
        />
      </StaticRouter>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders each response', () => {
    const { replies } = testTicket._replies;
    const page = mount(
      <StaticRouter>
        <TicketDetails
          ticket={testTicket}
          replies={testTicket._replies.replies}
          dispatch={() => { }}
        />
      </StaticRouter>
    );

    // original ticket + ticket responses
    expect(page.find('TicketReply').length).toBe(1 + Object.values(replies).length);
  });

  it('hide response options when ticket is closed', () => {
    const dispatch = sandbox.spy();
    const wrapper = shallow(
      <StaticRouter>
        <TicketDetails
          ticket={closedTicket}
          replies={closedTicket._replies.replies}
          dispatch={dispatch}
        />
      </StaticRouter>
    );

    expect(wrapper.dive().dive().find('Card#ticket-closed')).toHaveLength(1);
  });

  it('sends a reply on submit if a reply is there', async () => {
    const dispatch = sandbox.spy();
    const page = mount(
      <StaticRouter>
        <TicketDetails
          ticket={testTicket}
          replies={testTicket._replies.replies}
          dispatch={dispatch}
        />
      </StaticRouter>
    );

    const reply = 'This is my awesome response.';
    const replyWrapper = page.find('textarea#reply[name="reply"]');
    replyWrapper.simulate(
      'change',
      createSimulatedEvent('reply', reply)
    );

    dispatch.reset();
    await page.find('Form').props().onSubmit();

    // No attachments, so save attachment endpoint not called.
    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/support/tickets/${testTicket.id}/replies/`, {
        method: 'POST',
        body: { description: reply },
      }),
    ]);
  });

  it('sends attachments on submit if attachments are there', async () => {
    const dispatch = sandbox.spy();
    const page = mount(
      <StaticRouter>
        <TicketDetails
          ticket={testTicket}
          replies={testTicket._replies.replies}
          dispatch={dispatch}
        />
      </StaticRouter>
    );

    const attachments = [{ size: (MAX_UPLOAD_SIZE_MB - 0.5) * 1024 * 1024 }];
    page.instance().setState({ attachments });

    dispatch.reset();
    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/support/tickets/${testTicket.id}/attachments`, {
        method: 'POST',
      }),
    ]);
  });

  /**
   * @todo Figure out how to test this jawn again.
   */
  it.skip('doesn\'t allow attachments bigger than MAX_UPLOAD_SIZE_MB', async () => {
    const dispatch = jest.fn();

    const wrapper = shallow(
      <StaticRouter>
        <TicketDetails
          ticket={testTicket}
          replies={testTicket._replies.replies}
          dispatch={dispatch}
        />
      </StaticRouter>
    );

    const attachments = [{ size: (MAX_UPLOAD_SIZE_MB + 1) * 1024 * 1024 }];
    // This is a rare place where the only way to set this is by directly modifying state.
    const page = wrapper
      .dive()
      .dive()
      .instance();

    page
      .setState({ attachments });

    dispatch.mockReset();

    // Not a huge fan of this dive dive stuff...
    await wrapper.dive().dive().find('Form')
      .props()
      .onSubmit();

    expect(dispatch.mock.calls).toHaveLength(1);

    // Only attempting to upload an attachment
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [], 0);

    // But we've got errors
    expect(Object.values(wrapper.state('errors')).length).toBe(2);
  });
});
