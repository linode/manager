import { Event } from '@linode/api-v4';
import { Database, DatabaseInstance } from '@linode/api-v4/lib/databases/types';

export const getResizeProgress = (
  database: Database | DatabaseInstance,
  events: Event[] | undefined
): number | undefined => {
  const recentEvent = events?.find(
    (event) =>
      event.entity?.id === database.id && event.entity.type === 'database'
  );

  let progress: number | undefined = 0;
  if (recentEvent?.action === 'database_resize') {
    progress = recentEvent?.percent_complete ?? 0;
    database.status = 'resizing';
  } else {
    return undefined;
  }

  return progress;
};
