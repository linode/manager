import * as React from 'react';

import { Link } from 'src/components/Link';
import { List } from 'src/components/List';
import { ListItem } from 'src/components/ListItem';
import { getLinkOnClick } from 'src/utilities/emptyStateLandingUtils';

import type { ResourcesLinks } from './ResourcesLinksTypes';

export const ResourceLinks = (props: ResourcesLinks) => {
  const { linkAnalyticsEvent, links } = props;

  return (
    <List>
      {links.map((linkData) => (
        <ListItem key={linkData.to}>
          <Link
            external={linkData.external}
            onClick={getLinkOnClick(linkAnalyticsEvent, linkData.text)}
            to={linkData.to}
          >
            {linkData.text}
          </Link>
        </ListItem>
      ))}
    </List>
  );
};
