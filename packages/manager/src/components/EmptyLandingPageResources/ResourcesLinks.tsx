import * as React from 'react';
import List from 'src/components/core/List';
import ListItem from 'src/components/core/ListItem';
import Link from 'src/components/Link';
import { getLinkOnClick } from 'src/utilities/emptyStateLandingUtils';

interface ResourcesLinkProps {
  to: string;
  text: string;
}

interface LinkGAEventTemplateProps {
  category: string;
  action: string;
}

interface ResourcesLinksProps {
  links: ResourcesLinkProps[];
  linkGAEvent: LinkGAEventTemplateProps;
}

export const ResourceLinks = (props: ResourcesLinksProps) => {
  const { links, linkGAEvent } = props;

  return (
    <List>
      {links.map((linkData) => (
        <ListItem key={linkData.to}>
          <Link
            to={linkData.to}
            onClick={getLinkOnClick(linkGAEvent, linkData.text)}
          >
            {linkData.text}
          </Link>
        </ListItem>
      ))}
    </List>
  );
};
