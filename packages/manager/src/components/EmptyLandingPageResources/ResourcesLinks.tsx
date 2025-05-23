import { List, ListItem } from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { getLinkOnClick } from 'src/utilities/emptyStateLandingUtils';

import type { ResourcesLinks } from './ResourcesLinksTypes';

export const ResourceLinks = (props: ResourcesLinks) => {
  const { linkAnalyticsEvent, links, onClick } = props;

  return (
    <List>
      {links.map((linkData) => (
        <ListItem key={linkData.to}>
          <Link
            external={linkData.external}
            onClick={() => {
              getLinkOnClick(linkAnalyticsEvent, linkData.text);
              onClick?.();
            }}
            to={linkData.to}
          >
            {linkData.text}
          </Link>
        </ListItem>
      ))}
    </List>
  );
};
