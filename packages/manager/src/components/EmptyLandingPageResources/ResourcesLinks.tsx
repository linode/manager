import * as React from 'react';
import ExternalLinkIcon from 'src/assets/icons/external-link.svg';
import Link from 'src/components/Link';
import List from 'src/components/core/List';
import ListItem from 'src/components/core/ListItem';
import { getLinkOnClick } from 'src/utilities/emptyStateLandingUtils';
import { ResourcesLinkIcon } from 'src/components/EmptyLandingPageResources/ResourcesLinkIcon';
import type { ResourcesLinks } from './ResourcesLinksTypes';

export const ResourceLinks = (props: ResourcesLinks) => {
  const { linkGAEvent, links } = props;

  return (
    <List>
      {links.map((linkData) => (
        <ListItem key={linkData.to}>
          <Link
            to={linkData.to}
            onClick={getLinkOnClick(linkGAEvent, linkData.text)}
          >
            {linkData.text}
            {linkData.external && (
              <ResourcesLinkIcon icon={<ExternalLinkIcon />} />
            )}
          </Link>
        </ListItem>
      ))}
    </List>
  );
};
