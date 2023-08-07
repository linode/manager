import { Event } from '@linode/api-v4/lib/account/types';

import eventMessageGenerator from 'src/features/Events/eventMessageGenerator';
import { formatEventSeconds } from 'src/utilities/minute-conversion/minute-conversion';

import type { EntityVariants } from 'src/components/EntityIcon/EntityIcon';

/**
 * Shared helper logic for rendering events
 * Used in RenderEvent and RenderProgress Event
 */

export interface EventInfo {
  duration: string;
  message: null | string;
  type: EntityVariants;
}

export const useEventInfo = (event: Event): EventInfo => {
  const message = eventMessageGenerator(event);
  const type = (event.entity?.type ?? 'linode') as EntityVariants;

  const duration = formatEventSeconds(event.duration);

  return {
    duration,
    message,
    type,
  };
};

export default useEventInfo;
