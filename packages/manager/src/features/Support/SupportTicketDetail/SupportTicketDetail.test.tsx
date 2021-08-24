import { render, screen } from '@testing-library/react';
import * as React from 'react';
import {
  ClassNames,
  SupportTicketDetail,
  CombinedProps,
} from './SupportTicketDetail';

import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { supportTicketFactory } from 'src/factories/support';
import { rest, server } from 'src/mocks/testServer';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { profileFactory } from 'src/factories';
import { UseQueryResult } from 'react-query';
import { APIError } from '@linode/api-v4/lib/types';
import { Grants, Profile } from '@linode/api-v4/lib';

const classes: Record<ClassNames, string> = {
  title: '',
  label: '',
  labelIcon: '',
  status: '',
  open: '',
  ticketLabel: '',
  closed: '',
  breadcrumbs: '',
};

const props: CombinedProps = {
  classes,
  profile: { data: profileFactory.build() } as UseQueryResult<
    Profile,
    APIError[]
  >,
  grants: { data: {} } as UseQueryResult<Grants, APIError[]>,
  ...reactRouterProps,
};

const mockClosedTicket = () => {
  server.use(
    rest.get('*/support/tickets/:ticketId', (req, res, ctx) => {
      const ticket = supportTicketFactory.build({
        id: req.params.ticketId,
        status: 'closed',
      });
      return res(ctx.json(ticket));
    })
  );
};

describe('Support Ticket Detail', () => {
  describe('Component', () => {
    it('should display a loading spinner', () => {
      render(wrapWithTheme(<SupportTicketDetail {...props} />));
      expect(screen.getByTestId('circle-progress')).toBeInTheDocument();
    });

    it('should display the ticket summary', async () => {
      render(wrapWithTheme(<SupportTicketDetail {...props} />));
      expect(
        await screen.findByText(/#0: TEST Support Ticket/i)
      ).toBeInTheDocument();
    });

    it('should display the ticket body', async () => {
      const { findByText } = render(
        wrapWithTheme(<SupportTicketDetail {...props} />)
      );
      expect(await findByText(/TEST Support Ticket body/i)).toBeInTheDocument();
    });

    it("should display a 'new' icon and 'updated by' messaging", async () => {
      render(wrapWithTheme(<SupportTicketDetail {...props} />));
      expect(await screen.findByText(/new/)).toBeInTheDocument();
      expect(
        await screen.findByText(/updated by test-account/i)
      ).toBeInTheDocument();
    });

    it("should display a 'closed' status and 'closed by' messaging", async () => {
      mockClosedTicket();
      render(wrapWithTheme(<SupportTicketDetail {...props} />));
      expect(await screen.findByText(/closed/)).toBeInTheDocument();
      expect(
        await screen.findByText(/closed by test-account/i)
      ).toBeInTheDocument();
    });
  });
});
