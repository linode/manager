import * as React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import {
  EntityType,
  TicketType,
} from 'src/features/Support/SupportTickets/SupportTicketDrawer';

interface SupportLinkProps {
  title?: string;
  description?: string;
  text: string;
  entity?: EntityForTicketDetails;
  ticketType?: TicketType;
  onClick?: LinkProps['onClick'];
}

export interface EntityForTicketDetails {
  id: number;
  type: EntityType;
}

const SupportLink = (props: SupportLinkProps) => {
  const { description, entity, onClick, text, ticketType, title } = props;
  return (
    <Link
      to={{
        pathname: '/support/tickets',
        state: {
          description,
          entity,
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
