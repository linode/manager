import { supportQueries } from '@linode/queries';

import type { EventHandlerData } from '@linode/queries';

export const supportTicketEventHandler = ({
  event,
  invalidateQueries,
}: EventHandlerData) => {
  /**
   * Ticket events have entities that look like this:
   *
   * "entity": {
   *   "label": "Great news! We're upgrading your Block Storage",
   *   "id": 3674063,
   *   "type": "ticket",
   *   "url": "/v4/support/tickets/3674063"
   * }
   */

  // Invalidate paginated support tickets
  invalidateQueries({
    queryKey: supportQueries.tickets._def,
  });

  if (event.entity) {
    // If there is an entity associated with the event, invalidate that ticket
    invalidateQueries({
      queryKey: supportQueries.ticket(event.entity.id).queryKey,
    });
  }
};
