import { stackscriptQueries } from '@linode/queries';

import type { EventHandlerData } from '@linode/queries';

export const stackScriptEventHandler = ({
  event,
  invalidateQueries,
}: EventHandlerData) => {
  // Keep the infinite store up to date
  invalidateQueries({
    queryKey: stackscriptQueries.infinite._def,
  });
  invalidateQueries({
    queryKey: stackscriptQueries.all.queryKey,
  });

  // If the event has a StackScript entity attached, invalidate it
  if (event.entity?.id) {
    invalidateQueries({
      queryKey: stackscriptQueries.stackscript(event.entity.id).queryKey,
    });
  }
};
