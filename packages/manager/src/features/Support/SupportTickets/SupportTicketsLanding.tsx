import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';
import { AttachmentError } from '../SupportTicketDetail/SupportTicketDetail';
import SupportTicketDrawer from './SupportTicketDrawer';
import TicketList from './TicketList';
import LandingHeader from 'src/components/LandingHeader';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';

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

  const index = tabIndex === -1 ? 0 : tabIndex;

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
        value={index}
        onChange={(_, i) => {
          history.push(`/support/tickets?type=${tabs[i]}`);
        }}
      >
        <Tab data-qa-tab="Open Tickets" label="Open Tickets" />
        <Tab data-qa-tab="Closed Tickets" label="Closed Tickets" />
      </Tabs>
      <SafeTabPanel value={index} index={0}>
        <TicketList filterStatus="open" />
      </SafeTabPanel>
      <SafeTabPanel value={index} index={1}>
        <TicketList filterStatus="closed" />
      </SafeTabPanel>
      <SupportTicketDrawer
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
