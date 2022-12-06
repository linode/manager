import * as React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import {
  EntityType,
  TicketType,
} from 'src/features/Support/SupportTickets/SupportTicketDrawer';

interface Props {
  title?: string;
  description?: string;
  text: string;
  entity?: EntityForTicketDetails;
  ticketType?: TicketType; // Attempt to pass the ticketType as prop outside of entity
  onClick?: LinkProps['onClick'];
}
export interface EntityForTicketDetails {
  id: number;
  type: EntityType;
  ticketType?: TicketType; // TODO: move this elsewhere, but ensure the value gets passed to SupportTicketDrawer
}

const SupportLink = (props: Props) => {
  const { description, text, title, entity, ticketType, onClick } = props;

  return (
    <Link
      to={{
        pathname: '/support/tickets',
        state: {
          open: true,
          title,
          description,
          entity,
          ticketType, // Does not show up in SupportTicketDrawer
        },
      }}
      onClick={onClick}
    >
      {text}
    </Link>
  );
};

export default SupportLink;
