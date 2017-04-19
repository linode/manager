import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import * as fetch from '~/fetch';
import { MAX_UPLOAD_SIZE_MB } from '~/constants';
import { TicketPage } from '~/support/layouts/TicketPage';
import { testTicket, closedTicket } from '@/data/tickets';
import { expectRequest } from '@/common';
import { state } from '@/data';

describe('support/layouts/TicketPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders each response', () => {
    const { replies } = testTicket._replies;
    const page = mount(
      <TicketPage
        ticket={testTicket}
        replies={testTicket._replies.replies}
        dispatch={dispatch}
      />
    );

    // original ticket + ticket responses
    expect(page.find('TicketReply').length).to.equal(1 + Object.values(replies).length);
  });

  it('hide response options when ticket is closed', () => {
    const page = mount(
      <TicketPage
        ticket={closedTicket}
        replies={closedTicket._replies.replies}
        dispatch={dispatch}
      />
    );

    expect(page.find('Form').length).to.equal(0);
    const ticketClosedText = mount(page.instance().renderTicketClosed()).text();
    expect(page.find('#ticket-closed .Card-body').text()).to.equal(ticketClosedText);
  });

  it('sends a reply on submit if a reply is there', async () => {
    const page = mount(
      <TicketPage
        ticket={testTicket}
        replies={testTicket._replies.replies}
        dispatch={dispatch}
      />
    );

    const reply = 'This is my awesome response.';
    page.find('#reply[name="reply"]').simulate(
      'change', { target: { name: 'reply', value: reply } });

    page.find('Form').simulate('submit');

    // No attachments, so save attachment endpoint not called.
    expect(dispatch.callCount).to.equal(1);
    await expectRequest(dispatch.firstCall.args[0], `/support/tickets/${testTicket.id}/replies/`, {
      method: 'POST',
      body: { description: reply },
    });
  });

  it('sends attachments on submit if attachments are there', async () => {
    const page = mount(
      <TicketPage
        ticket={testTicket}
        replies={testTicket._replies.replies}
        dispatch={dispatch}
      />
    );

    const attachments = [{ size: (MAX_UPLOAD_SIZE_MB - 0.5) * 1024 * 1024 }];
    page.instance().setState({ attachments });

    dispatch.reset();
    const fetchStub = sandbox.stub(fetch, 'fetch').returns({ json: () => {} });
    page.find('Form').simulate('submit');

    // No reply, so save reply endpoint not called.
    expect(dispatch.callCount).to.equal(1);

    // Trigger request
    const fn = dispatch.firstCall.args[0];
    dispatch.reset();
    await fn(dispatch, () => state);

    expect(fetchStub.callCount).to.equal(1);
    expect(fetchStub.firstCall.args[1]).to.equal(`/support/tickets/${testTicket.id}/attachments`);
  });

  it('doesn\'t allow attachments bigger than MAX_UPLOAD_SIZE_MB', () => {
    const page = mount(
      <TicketPage
        ticket={testTicket}
        replies={testTicket._replies.replies}
        dispatch={dispatch}
      />
    );

    const attachments = [{ size: (MAX_UPLOAD_SIZE_MB + 1) * 1024 * 1024 }];
    page.instance().setState({ attachments });

    dispatch.reset();
    page.find('Form').simulate('submit');

    // No reply and attachment is too big, so no endpoints are called.
    expect(dispatch.callCount).to.equal(0);
  });
});
