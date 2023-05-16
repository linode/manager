import { EventWithStore } from 'src/events';
import { queryKey } from './linodes';

export const linodeEventsHandler = ({ event, queryClient }: EventWithStore) => {
  // For now, invalidate any linode query. We can fine tune later.
  queryClient.invalidateQueries([queryKey]);
};
