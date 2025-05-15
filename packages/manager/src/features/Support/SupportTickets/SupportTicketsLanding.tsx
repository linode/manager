import { useNavigate, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
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
  /** ?drawerOpen=true to allow external links to go directly to the ticket drawer */
  const { dialogOpen } = useSearch({
    strict: false,
  });

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
      to: '/support/tickets/$ticketId',
      state: { attachmentErrors },
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
          navigate({
            to: '/support/tickets',
            search: { dialogOpen: true },
          })
        }
        spacingBottom={4}
        title="Tickets"
      />
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel data-qa-open-tickets-tab index={0}>
              <TicketList filterStatus="open" />
            </SafeTabPanel>
            <SafeTabPanel data-qa-closed-tickets-tab index={1}>
              <TicketList filterStatus="closed" />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
      <SupportTicketDialog
        onClose={() =>
          navigate({
            to: '/support/tickets',
            search: { dialogOpen: false },
          })
        }
        onSuccess={handleAddTicketSuccess}
        open={Boolean(dialogOpen)}
      />
    </React.Fragment>
  );
};
