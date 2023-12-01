import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanel } from 'src/components/Tabs/TabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

import { AttachmentError } from '../SupportTicketDetail/SupportTicketDetail';
import { SupportTicketDialog } from './SupportTicketDialog';
import TicketList from './TicketList';

const tabs = ['open', 'closed'];

const SupportTicketsLanding = () => {
  const location = useLocation<any>();
  const history = useHistory();

  /** ?drawerOpen=true to allow external links to go directly to the ticket drawer */
  const parsedParams = getQueryParamsFromQueryString(location.search);

  const stateParams = location.state;

  const [drawerOpen, setDrawerOpen] = React.useState(
    stateParams ? stateParams.open : parsedParams.drawerOpen === 'true'
  );

  // @todo this should be handled in the support ticket component
  // and probably does not need to use state
  const [prefilledDescription] = React.useState(
    stateParams ? stateParams.description : undefined
  );
  const [prefilledTitle] = React.useState(
    stateParams ? stateParams.title : undefined
  );
  const [prefilledEntity] = React.useState(
    stateParams ? stateParams.entity : undefined
  );
  const [prefilledTicketType] = React.useState(
    stateParams ? stateParams.ticketType : undefined
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
          <TabPanel>
            <TicketList filterStatus="open" />
          </TabPanel>
          <TabPanel>
            <TicketList filterStatus="closed" />
          </TabPanel>
        </TabPanels>
      </Tabs>
      <SupportTicketDialog
        onClose={() => setDrawerOpen(false)}
        onSuccess={handleAddTicketSuccess}
        open={drawerOpen}
        prefilledDescription={prefilledDescription}
        prefilledEntity={prefilledEntity}
        prefilledTicketType={prefilledTicketType}
        prefilledTitle={prefilledTitle}
      />
    </React.Fragment>
  );
};

export default SupportTicketsLanding;
