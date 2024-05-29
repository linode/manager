import * as React from 'react';

import { Link } from 'src/components/Link';
import { getLinkForEvent } from 'src/utilities/getEventsActionLink';

import type { Event, EventAction } from '@linode/api-v4';

interface MessageLinkEntity {
  action: EventAction;
  entity: Event['entity'] | Event['secondary_entity'] | null;
}

export const EventMessageLink = (props: MessageLinkEntity) => {
  const { action, entity } = props;

  const renderDefault = () => {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{entity?.label ?? ''}</>;
  };

  if (!entity?.url || !entity?.label) {
    return renderDefault();
  }

  const link = getLinkForEvent(action, entity);

  return link ? <Link to={link ?? ''}>{entity.label}</Link> : renderDefault();
};
