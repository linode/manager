import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { MAX_UPLOAD_SIZE_MB } from '~/constants';
import { TicketPage } from '~/support/layouts/TicketPage';

import { expectRequest, expectDispatchOrStoreErrors } from '@/common';
import { testTicket, closedTicket } from '@/data/tickets';


describe('support/layouts/TicketPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders each response', () => {
    const { replies } = testTicket._replies;
    const page = mount(
      <TicketPage
        ticket={testTicket}
        replies={testTicket._replies.replies}
        dispatch={() => {}}
      />
    );

    // original ticket + ticket responses
    expect(page.find('TicketReply').length).to.equal(1 + Object.values(replies).length);
  });

  it('hide response options when ticket is closed', () => {
    const dispatch = sandbox.spy();
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
    const dispatch = sandbox.spy();
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

    await page.find('Form').props().onSubmit();

    // No attachments, so save attachment endpoint not called.
    expect(dispatch.callCount).to.equal(1);
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
      <TicketPage
        ticket={testTicket}
        replies={testTicket._replies.replies}
        dispatch={dispatch}
      />
    );

    const attachments = [{ size: (MAX_UPLOAD_SIZE_MB - 0.5) * 1024 * 1024 }];
    page.instance().setState({ attachments });

    dispatch.reset();
    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/support/tickets/${testTicket.id}/attachments`),
    ]);
  });

  it('doesn\'t allow attachments bigger than MAX_UPLOAD_SIZE_MB', async () => {
    const dispatch = sandbox.spy();
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
    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    // Only attempting to upload an attachment
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [], 1);
    // But we've got errors
    console.log(page.instance().errors, page.state('errors'));
    expect(Object.values(page.state('errors')).length).to.equal(1);
  });
});
