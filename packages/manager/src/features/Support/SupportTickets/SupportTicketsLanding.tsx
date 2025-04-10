import { getQueryParamsFromQueryString } from '@linode/utilities';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanel } from 'src/components/Tabs/TabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';

import { SupportTicketDialog } from './SupportTicketDialog';
import { TicketList } from './TicketList';

import type { AttachmentError } from '../SupportTicketDetail/SupportTicketDetail';
import type { BaseQueryParams } from '@linode/utilities';
import type { BooleanString } from 'src/features/Linodes/types';

interface QueryParams extends BaseQueryParams {
  drawerOpen: BooleanString;
}

const tabs = ['open', 'closed'];

const SupportTicketsLanding = () => {
  const location = useLocation<any>();
  const history = useHistory();

  /** ?drawerOpen=true to allow external links to go directly to the ticket drawer */
  const parsedParams = getQueryParamsFromQueryString<QueryParams>(
    location.search
  );

  const stateParams = location.state;

  const [drawerOpen, setDrawerOpen] = React.useState(
    stateParams ? stateParams.open : parsedParams.drawerOpen === 'true'
  );

  const handleAddTicketSuccess = (
    ticketId: number,
    attachmentErrors: AttachmentError[] = []
  ) => {
    history.push({
      pathname: `/support/tickets/${ticketId}`,
      state: { attachmentErrors },
    });
    setDrawerOpen(false);
  };

  const handleButtonKeyPress = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter') {
      setDrawerOpen(true);
    }
  };

  const tabIndex = tabs.indexOf(parsedParams.type);

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Support Tickets" />
      <LandingHeader
        buttonDataAttrs={{ 'data-qa-open-ticket-link': true }}
        createButtonText="Open New Ticket"
        data-qa-breadcrumb
        onButtonClick={() => setDrawerOpen(true)}
        onButtonKeyPress={handleButtonKeyPress}
        title="Tickets"
      />
      <Tabs
        onChange={(index) => {
          history.push(`/support/tickets?type=${tabs[index]}`);
        }}
        index={tabIndex === -1 ? 0 : tabIndex}
      >
        <TabList>
          <Tab data-qa-tab="Open Tickets">Open Tickets</Tab>
          <Tab data-qa-tab="Closed Tickets">Closed Tickets</Tab>
        </TabList>
        <TabPanels>
          <TabPanel data-qa-open-tickets-tab>
            <TicketList filterStatus="open" />
          </TabPanel>
          <TabPanel data-qa-closed-tickets-tab>
            <TicketList filterStatus="closed" />
          </TabPanel>
        </TabPanels>
      </Tabs>
      <SupportTicketDialog
        onClose={() => setDrawerOpen(false)}
        onSuccess={handleAddTicketSuccess}
        open={drawerOpen}
      />
    </React.Fragment>
  );
};

export default SupportTicketsLanding;

export const supportTicketsLandingLazyRoute = createLazyRoute(
  '/support/tickets'
)({
  component: SupportTicketsLanding,
});
