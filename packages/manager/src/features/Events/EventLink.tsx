import * as React from 'react';

import { Link } from 'src/components/Link';
import { getLinkForEvent } from 'src/utilities/getEventsActionLink';

import type { Event } from '@linode/api-v4';

interface MessageLinkEntity {
  event: Event;
  to: 'entity' | 'secondaryEntity';
}

/**
 * A component that renders a link to an entity or secondary entity.
 * Meant to be used in the context of an event message.
 */
export const EventLink = (props: MessageLinkEntity) => {
  const { event, to } = props;
  const entity = to === 'entity' ? event.entity : event.secondary_entity;

  const renderDefault = () => {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{entity?.label ?? ''}</>;
  };

  if (!entity?.url || !entity?.label) {
    return renderDefault();
  }

  const link = getLinkForEvent(event.action, entity);

  return link ? <Link to={link}>{entity.label}</Link> : renderDefault();
};
