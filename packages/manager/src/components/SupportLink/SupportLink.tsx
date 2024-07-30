import * as React from 'react';
import { Link } from 'react-router-dom';

import type { LinkProps } from 'react-router-dom';
import type {
  EntityType,
  FormPayloadValues,
  TicketType,
} from 'src/features/Support/SupportTickets/SupportTicketDialog';

interface SupportLinkProps {
  description?: string;
  entity?: EntityForTicketDetails;
  formValues?: FormPayloadValues;
  onClick?: LinkProps['onClick'];
  text: string;
  ticketType?: TicketType;
  title?: string;
}

export interface EntityForTicketDetails {
  id: number | undefined;
  type: EntityType;
}

const SupportLink = (props: SupportLinkProps) => {
  const {
    description,
    entity,
    formValues,
    onClick,
    text,
    ticketType,
    title,
  } = props;

  return (
    <Link
      to={{
        pathname: '/support/tickets',
        state: {
          description,
          entity,
          formValues,
          open: true,
          ticketType,
          title,
        },
      }}
      onClick={onClick}
    >
      {text}
    </Link>
  );
};

export { SupportLink };
