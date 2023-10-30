import { render, screen } from '@testing-library/react';
import * as React from 'react';

import {
  supportReplyFactory,
  supportTicketFactory,
} from 'src/factories/support';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { SupportTicketDetail } from './SupportTicketDetail';

describe('Support Ticket Detail', () => {
  it('should display a loading spinner', () => {
    render(wrapWithTheme(<SupportTicketDetail />));
    expect(screen.getByTestId('circle-progress')).toBeInTheDocument();
  });

  it('should display the ticket body', async () => {
    server.use(
      rest.get('*/support/tickets/:ticketId', (req, res, ctx) => {
        const ticket = supportTicketFactory.build({
          description: 'TEST Support Ticket body',
          id: req.params.ticketId,
          status: 'open',
          summary: '#0: TEST Support Ticket',
        });
        return res(ctx.json(ticket));
      })
    );
    const { findByText } = render(wrapWithTheme(<SupportTicketDetail />));
    expect(
      await screen.findByText(/#0: TEST Support Ticket/i)
    ).toBeInTheDocument();
    expect(await findByText(/TEST Support Ticket body/i)).toBeInTheDocument();
  });

  it("should display a 'new' icon and 'updated by' messaging", async () => {
    server.use(
      rest.get('*/support/tickets/:ticketId', (req, res, ctx) => {
        const ticket = supportTicketFactory.build({
          id: req.params.ticketId,
          status: 'new',
          updated_by: 'test-account',
        });
        return res(ctx.json(ticket));
      })
    );
    render(wrapWithTheme(<SupportTicketDetail />));
    expect(await screen.findByText(/new/)).toBeInTheDocument();
    expect(
      await screen.findByText(/updated by test-account/i)
    ).toBeInTheDocument();
  });

  it("should display a 'closed' status and 'closed by' messaging", async () => {
    server.use(
      rest.get('*/support/tickets/:ticketId', (req, res, ctx) => {
        const ticket = supportTicketFactory.build({
          id: req.params.ticketId,
          status: 'closed',
        });
        return res(ctx.json(ticket));
      })
    );
    render(wrapWithTheme(<SupportTicketDetail />));
    expect(await screen.findByText(/closed/)).toBeInTheDocument();
    expect(
      await screen.findByText(/closed by test-account/i)
    ).toBeInTheDocument();
  });

  it('should display replies', async () => {
    server.use(
      rest.get('*/support/tickets/:ticketId/replies', (req, res, ctx) => {
        const ticket = supportReplyFactory.buildList(1, {
          description:
            'Hi, this is lindoe support! OMG, sorry your Linode is broken!',
        });
        return res(ctx.json(makeResourcePage(ticket)));
      }),
      rest.get('*/support/tickets/:ticketId', (req, res, ctx) => {
        const ticket = supportTicketFactory.build({
          description: 'this ticket should have a reply on it',
          id: req.params.ticketId,
          status: 'open',
          summary: 'My Linode is broken :(',
        });
        return res(ctx.json(ticket));
      })
    );
    render(wrapWithTheme(<SupportTicketDetail />));
    expect(
      await screen.findByText(
        'Hi, this is lindoe support! OMG, sorry your Linode is broken!'
      )
    ).toBeInTheDocument();
  });
});
