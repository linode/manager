import { useNavigate, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useTabs } from 'src/hooks/useTabs';

import { SupportTicketDialog } from './SupportTicketDialog';
import { TicketList } from './TicketList';

import type { AttachmentError } from '../SupportTicketDetail/SupportTicketDetail';

export const SupportTicketsLanding = () => {
  const navigate = useNavigate();
  const { drawerOpen } = useSearch({
    from: '/support/tickets',
  });

  /** ?drawerOpen=true to allow external links to go directly to the ticket drawer */
  // const parsedParams = getQueryParamsFromQueryString<QueryParams>(
  //   location.search
  // );

  const { tabs, tabIndex, handleTabChange } = useTabs([
    {
      title: 'Open Tickets',
      to: '/support/tickets/open',
    },
    {
      title: 'Closed Tickets',
      to: '/support/tickets/closed',
    },
  ]);

  const handleAddTicketSuccess = (
    ticketId: number,
    attachmentErrors: AttachmentError[] = []
  ) => {
    navigate({
      to: '/support/tickets',
      state: { attachmentErrors },
      search: {
        drawerOpen: false,
      },
      params: {
        ticketId,
      },
    });
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Support Tickets" />
      <LandingHeader
        buttonDataAttrs={{ 'data-qa-open-ticket-link': true }}
        createButtonText="Open New Ticket"
        data-qa-breadcrumb
        onButtonClick={() =>
          navigate({ to: '/support/tickets', search: { drawerOpen: true } })
        }
        onButtonKeyPress={handleButtonKeyPress}
        spacingBottom={4}
        title="Tickets"
      />
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <TabPanels>
          <SafeTabPanel data-qa-open-tickets-tab index={0}>
            <TicketList filterStatus="open" />
          </SafeTabPanel>
          <SafeTabPanel data-qa-closed-tickets-tab index={1}>
            <TicketList filterStatus="closed" />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
      <SupportTicketDialog
        onClose={() =>
          navigate({ to: '/support/tickets', search: { drawerOpen: false } })
        }
        onSuccess={handleAddTicketSuccess}
        open={drawerOpen}
      />
    </React.Fragment>
  );
};
