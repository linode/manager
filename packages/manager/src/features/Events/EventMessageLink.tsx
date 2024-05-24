import * as React from 'react';

import { Link } from 'src/components/Link';

import type { Event } from '@linode/api-v4';

interface MessageLinkEntity {
  entity: Event['entity'] | Event['secondary_entity'] | undefined;
}

export const EventMessageLink = (props: MessageLinkEntity) => {
  const { entity } = props;

  if (!entity?.url) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{entity?.label ?? ''}</>;
  }

  return <Link to={entity.url}>{entity.label}</Link>;
};
