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
  ticketType?: TicketType;
  onClick?: LinkProps['onClick'];
}

export interface EntityForTicketDetails {
  id: number;
  type: EntityType;
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
          ticketType,
        },
      }}
      onClick={onClick}
    >
      {text}
    </Link>
  );
};

export default SupportLink;
