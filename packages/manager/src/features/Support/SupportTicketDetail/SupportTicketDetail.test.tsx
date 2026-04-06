import { breakpoints } from '@linode/ui';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

import {
  supportReplyFactory,
  supportTicketFactory,
} from 'src/factories/support';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import {
  renderWithTheme,
  resizeScreenSize,
  wrapWithTheme,
} from 'src/utilities/testHelpers';

import { SupportTicketDetail } from './SupportTicketDetail';

const queryMocks = vi.hoisted(() => ({
  useLocation: vi.fn(),
  useParams: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useLocation: queryMocks.useLocation,
    useParams: queryMocks.useParams,
  };
});

describe('Support Ticket Detail', () => {
  beforeAll(() => {
    resizeScreenSize(breakpoints.values.lg);
    queryMocks.useParams.mockReturnValue({ ticketId: '1' });
    queryMocks.useLocation.mockReturnValue({
      state: {},
      pathname: '/support/tickets/1',
    });
  });

  it('should display a loading spinner', () => {
    renderWithTheme(<SupportTicketDetail />);
    expect(screen.getByTestId('circle-progress')).toBeInTheDocument();
  });

  it('should display the ticket body', async () => {
    server.use(
      http.get('*/support/tickets/:ticketId', ({ params }) => {
        const ticket = supportTicketFactory.build({
          description: 'TEST Support Ticket body',
          id: Number(params.ticketId),
          status: 'open',
          summary: '#0: TEST Support Ticket',
        });
        return HttpResponse.json(ticket);
      })
    );
    const { findByText } = render(wrapWithTheme(<SupportTicketDetail />));
    expect(
      await screen.findByText(/#0: TEST Support Ticket/i)
    ).toBeInTheDocument();
    expect(await findByText(/TEST Support Ticket body/i)).toBeInTheDocument();
  });

  it("should display a 'new' status and 'updated by' messaging", async () => {
    server.use(
      http.get('*/support/tickets/:ticketId', ({ params }) => {
        const ticket = supportTicketFactory.build({
          id: Number(params.ticketId),
          status: 'new',
          updated_by: 'test-account',
        });
        return HttpResponse.json(ticket);
      })
    );
    renderWithTheme(<SupportTicketDetail />);
    expect(await screen.findByText(/New/)).toBeInTheDocument();
    expect(
      await screen.findByText(/updated by test-account/i)
    ).toBeInTheDocument();
  });

  it("should display an 'open' status and 'updated by' messaging", async () => {
    server.use(
      http.get('*/support/tickets/:ticketId', ({ params }) => {
        const ticket = supportTicketFactory.build({
          id: Number(params.ticketId),
          status: 'open',
          updated_by: 'test-account',
        });
        return HttpResponse.json(ticket);
      })
    );
    renderWithTheme(<SupportTicketDetail />);
    expect(await screen.findByText(/Open/)).toBeInTheDocument();
    expect(
      await screen.findByText(/updated by test-account/i)
    ).toBeInTheDocument();
  });

  it("should display a 'closed' status and 'closed by' messaging", async () => {
    server.use(
      http.get('*/support/tickets/:ticketId', ({ params }) => {
        const ticket = supportTicketFactory.build({
          id: Number(params.ticketId),
          status: 'closed',
        });
        return HttpResponse.json(ticket);
      })
    );
    renderWithTheme(<SupportTicketDetail />);
    expect(await screen.findByText('Closed')).toBeInTheDocument();
    expect(
      await screen.findByText(/closed by test-account/i)
    ).toBeInTheDocument();
  });

  it('should display an entity in the status details if the ticket has one', async () => {
    const mockEntity = {
      id: 1,
      label: 'my-linode-entity',
      type: 'linode',
      url: '/',
    };
    server.use(
      http.get('*/support/tickets/:ticketId', ({ params }) => {
        const ticket = supportTicketFactory.build({
          entity: mockEntity,
          id: Number(params.ticketId),
        });
        return HttpResponse.json(ticket);
      })
    );
    renderWithTheme(<SupportTicketDetail />);
    const entity = await screen.findByText(mockEntity.label, { exact: false });
    const entityTextLink = entity.closest('a');

    expect(entity).toBeInTheDocument();
    expect(entityTextLink).toBeInTheDocument();
    expect(entityTextLink?.getAttribute('aria-label')).toContain(
      mockEntity.label
    );
  });

  it('should display replies', async () => {
    server.use(
      http.get('*/support/tickets/:ticketId/replies', () => {
        const ticket = supportReplyFactory.buildList(1, {
          description:
            'Hi, this is lindoe support! OMG, sorry your Linode is broken!',
        });
        return HttpResponse.json(makeResourcePage(ticket));
      }),
      http.get('*/support/tickets/:ticketId', ({ params }) => {
        const ticket = supportTicketFactory.build({
          description: 'this ticket should have a reply on it',
          id: Number(params.ticketId),
          status: 'open',
          summary: 'My Linode is broken :(',
        });
        return HttpResponse.json(ticket);
      })
    );
    renderWithTheme(<SupportTicketDetail />);
    expect(
      await screen.findByText(
        'Hi, this is lindoe support! OMG, sorry your Linode is broken!'
      )
    ).toBeInTheDocument();
  });
});
