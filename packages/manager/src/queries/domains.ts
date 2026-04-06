import { domainQueries } from '@linode/queries';

import type { EventHandlerData } from '@linode/queries';

export const domainEventsHandler = ({
  event,
  invalidateQueries,
}: EventHandlerData) => {
  const domainId = event.entity?.id;

  if (!domainId) {
    return;
  }

  if (event.action.startsWith('domain_record')) {
    // Invalidate the domain's records because they may have changed
    invalidateQueries({
      queryKey: domainQueries.domain(domainId)._ctx.records.queryKey,
    });
  } else {
    // Invalidate paginated lists
    invalidateQueries({
      queryKey: domainQueries.domains.queryKey,
    });

    // Invalidate the domain's details
    invalidateQueries({
      exact: true,
      queryKey: domainQueries.domain(domainId).queryKey,
    });
  }
};
