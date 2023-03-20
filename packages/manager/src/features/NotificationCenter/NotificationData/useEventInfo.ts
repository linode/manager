import { Event } from '@linode/api-v4/lib/account/types';
import { path } from 'ramda';
import eventMessageGenerator from 'src/eventMessageGenerator';
import {
  EntityType,
  getEntityByIDFromStore,
} from 'src/utilities/getEntityByIDFromStore';
import { formatEventSeconds } from 'src/utilities/minute-conversion/minute-conversion';
import { Variant } from 'src/components/EntityIcon';

/**
 * Shared helper logic for rendering events
 * Used in RenderEvent and RenderProgress Event
 */

export interface EventInfo {
  duration: string;
  message: string | null;
  type: Variant;
  status?: string;
}

export const useEventInfo = (event: Event): EventInfo => {
  const message = eventMessageGenerator(event);
  const type = (event.entity?.type ?? 'linode') as Variant;

  const entity = getEntityByIDFromStore(
    type as EntityType,
    event.entity?.id ?? -1
  );

  const status = path<string>(['status'], entity);

  const duration = formatEventSeconds(event.duration);

  return {
    duration,
    message,
    status,
    type,
  };
};

export default useEventInfo;
