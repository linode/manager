import * as React from 'react';

import { Link } from 'src/components/Link';

import type {
  EntityType,
  FormPayloadValues,
  TicketType,
} from 'src/features/Support/SupportTickets/SupportTicketDialog';

export interface SupportLinkProps {
  description?: string;
  entity?: EntityForTicketDetails;
  formPayloadValues?: FormPayloadValues;
  onClick?: () => void;
  text: string;
  ticketType?: TicketType;
  title?: string;
}

export interface EntityForTicketDetails {
  id?: number;
  type: EntityType;
}

const SupportLink = (props: SupportLinkProps) => {
  const {
    description,
    entity,
    formPayloadValues,
    onClick,
    text,
    ticketType,
    title,
  } = props;

  return (
    <Link
      onClick={onClick}
      search={{
        dialogOpen: true,
      }}
      state={(prev) => {
        return {
          ...prev,
          description,
          entity,
          formPayloadValues,
          ticketType,
          title,
        };
      }}
      to="/support/tickets/open"
    >
      {text}
    </Link>
  );
};

export { SupportLink };
