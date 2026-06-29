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
      pendoId: 'Reserved IPs Landing Empty-Docs Overview',
      text: 'Overview of Reserved IPs',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/reserved-ips',
    },
    {
      pendoId: 'Reserved IPs Landing Empty-Docs Getting Started',
      text: 'Getting Started with Reserved IPs',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-reserved-ips',
    },
    {
      pendoId: 'Reserved IPs Landing Empty-Docs Reserve an IP',
      text: 'Reserve an IP Address',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/reserve-an-ip',
    },
    {
      pendoId: 'Reserved IPs Landing Empty-Docs Managing IPs',
      text: 'Managing and Assigning Reserved IPs',
      to: 'https://techdocs.akamai.com/cloud-computing/update/docs/managing-reserved-ips',
    },
  ],
  moreInfo: {
    pendoId: 'Reserved IP Landing Empty-Additional Reserved IP Docs',
    text: 'View additional Reserved IP documentation',
    to: docsLink,
  },
  title: 'Getting Started Guides',
};

export const linkAnalyticsEvent: ResourcesLinks['linkAnalyticsEvent'] = {
  action: 'Click:link',
  category: 'Reserved IPs landing page empty',
};
