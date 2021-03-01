import { Event } from '@linode/api-v4/lib/account/types';
import { path } from 'ramda';
import eventMessageGenerator from 'src/eventMessageGenerator';
import { formatEventWithUsername } from 'src/features/Events/Event.helpers';
import {
  EntityType,
  getEntityByIDFromStore,
} from 'src/utilities/getEntityByIDFromStore';
import createLinkHandlerForNotification from 'src/utilities/getEventsActionLinkStrings';
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
  linkTarget?: string;
}

export const useEventInfo = (event: Event): EventInfo => {
  const message = eventMessageGenerator(event);
  const messageWithUsername =
    message === null
      ? null
      : formatEventWithUsername(event.action, event.username, message);
  const type = (event.entity?.type ?? 'linode') as Variant;

  const entity = getEntityByIDFromStore(
    type as EntityType,
    event.entity?.id ?? -1
  );

  const linkTarget = createLinkHandlerForNotification(
    event.action,
    event.entity,
    false
  );

  const status = path<string>(['status'], entity);

  const duration = formatEventSeconds(event.duration);

  return {
    duration,
    message: messageWithUsername,
    status,
    type,
    linkTarget,
  };
};

export default useEventInfo;
