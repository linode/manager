import { AppEventHandler } from 'src/hooks/useAppEventHandlers';
import { queryKey } from './linodes';

export const linodeEventsHandler: AppEventHandler = (_, queryClient) => {
  // For now, invalidate any linode query. We can fine tune later.
  queryClient.invalidateQueries([queryKey]);
};
