import * as React from 'react';
import NotificationSection, { NotificationItem } from './NotificationSection';

interface Props {
  error?: boolean;
  loading: boolean;
  openTickets: NotificationItem[];
}

export const OpenSupportTickets: React.FC<Props> = props => {
  const { error, loading, openTickets } = props;

  if (error) {
    // Open for debate. I'd like to avoid showing separate
    // error states for all of these, as they take up screen
    // real estate.
    return null;
  }

  return (
    <NotificationSection
      content={openTickets}
      header="Open Support Tickets"
      showMoreText="View all tickets"
      showMoreTarget="/support/tickets"
      loading={loading}
    />
  );
};

export default React.memo(OpenSupportTickets);
