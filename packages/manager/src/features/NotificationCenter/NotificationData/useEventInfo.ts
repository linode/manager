import { Event } from '@linode/api-v4/lib/account/types';
import { path } from 'ramda';

import eventMessageGenerator from 'src/eventMessageGenerator';
import { ApplicationStore } from 'src/store';
import {
  EntityType,
  getEntityByIDFromStore,
} from 'src/utilities/getEntityByIDFromStore';
import { formatEventSeconds } from 'src/utilities/minute-conversion/minute-conversion';

import type { EntityVariants } from 'src/components/EntityIcon/EntityIcon';

/**
 * Shared helper logic for rendering events
 * Used in RenderEvent and RenderProgress Event
 */

export interface EventInfo {
  duration: string;
  message: null | string;
  status?: string;
  type: EntityVariants;
}

export const useEventInfo = (
  event: Event,
  store: ApplicationStore
): EventInfo => {
  const message = eventMessageGenerator(event);
  const type = (event.entity?.type ?? 'linode') as EntityVariants;

  const entity = getEntityByIDFromStore(
    type as EntityType,
    event.entity?.id ?? -1,
    store
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
