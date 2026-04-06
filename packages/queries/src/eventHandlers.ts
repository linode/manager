import type { Event } from '@linode/api-v4';
import type {
  InvalidateQueryFilters,
  QueryClient,
} from '@tanstack/react-query';

// TODO: move all event handlers to this file once migrated
export interface EventHandlerData {
  event: Event;
  invalidateQueries: (filters: InvalidateQueryFilters) => Promise<void>;
  queryClient: QueryClient;
}
