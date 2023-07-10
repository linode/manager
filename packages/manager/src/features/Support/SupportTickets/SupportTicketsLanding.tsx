import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Tab } from 'src/components/core/ReachTab';
import { TabList } from 'src/components/core/ReachTabList';
import TabPanel from 'src/components/core/ReachTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';
import { AttachmentError } from '../SupportTicketDetail/SupportTicketDetail';
import { SupportTicketDialog } from './SupportTicketDialog';
import TicketList from './TicketList';
import LandingHeader from 'src/components/LandingHeader';

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
        title="Tickets"
        createButtonText="Open New Ticket"
        onButtonClick={() => setDrawerOpen(true)}
        onButtonKeyPress={handleButtonKeyPress}
        data-qa-breadcrumb
        buttonDataAttrs={{ 'data-qa-open-ticket-link': true }}
      />
      <Tabs
        index={tabIndex === -1 ? 0 : tabIndex}
        onChange={(index) => {
          history.push(`/support/tickets?type=${tabs[index]}`);
        }}
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
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={handleAddTicketSuccess}
        prefilledDescription={prefilledDescription}
        prefilledTitle={prefilledTitle}
        prefilledEntity={prefilledEntity}
        prefilledTicketType={prefilledTicketType}
      />
    </React.Fragment>
  );
};

export default SupportTicketsLanding;
