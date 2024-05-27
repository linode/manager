import * as React from 'react';

import { Link } from 'src/components/Link';
import { getLinkForEvent } from 'src/utilities/getEventsActionLink';

import type { Event, EventAction } from '@linode/api-v4';

interface MessageLinkEntity {
  action: EventAction | undefined;
  entity: Event['entity'] | Event['secondary_entity'] | null | undefined;
}

export const EventMessageLink = (props: MessageLinkEntity) => {
  const { action, entity } = props;

  if (!entity?.url || !entity?.label || !action) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{entity?.label ?? ''}</>;
  }

  const link = getLinkForEvent(action, entity ?? null);

  return <Link to={link ?? ''}>{entity.label}</Link>;
};
