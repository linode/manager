import { docsLink } from 'src/utilities/emptyStateLandingUtils';

import type {
  ResourcesHeaders,
  ResourcesLinks,
  ResourcesLinkSection,
} from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';

export const headers: ResourcesHeaders = {
  description:
    'Reserve and manage public IPv4 addresses across regions, and assign them to resources like Linodes or NodeBalancers when needed.',
  subtitle: 'Dedicated IP addressing for your cloud resources',
  title: 'Reserved IP Addresses',
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
    {
      text: 'Overview of Reserved IPs',
      to: 'https://www.linode.com/docs/', // To be updated with actual Reserved IPs documentation link once available
    },
    {
      text: 'Getting Started with Reserved IPs',
      to: 'https://www.linode.com/docs/', // To be updated with actual Reserved IPs documentation link once available
    },
    {
      text: 'Managing and Assigning Reserved IPs',
      to: 'https://www.linode.com/docs/', // To be updated with actual Reserved IPs documentation link once available
    },
  ],
  moreInfo: {
    text: 'View additional Reserved IP documentation',
    to: docsLink,
  },
  title: 'Getting Started Guides',
};

export const linkAnalyticsEvent: ResourcesLinks['linkAnalyticsEvent'] = {
  action: 'Click:link',
  category: 'Reserved IPs landing page empty',
};
