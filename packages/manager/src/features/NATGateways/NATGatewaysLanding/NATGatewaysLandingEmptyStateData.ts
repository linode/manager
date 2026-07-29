import type {
  ResourcesHeaders,
  ResourcesLinks,
  ResourcesLinkSection,
} from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';

export const headers: ResourcesHeaders = {
  description:
    'Outbound-only network address translation (NAT) gateway for VPCs',
  subtitle:
    'Efficiently connect multiple Linodes to the public internet using shared IPv4 addresses while automatically blocking unsolicited inbound internet traffic.',
  title: 'NAT Gateways',
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
    {
      text: 'NAT Gateway Overview',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/nat-gateway',
    },
    {
      text: 'Getting Started with NAT Gateway',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-nat-gateway',
    },
    {
      text: 'Create a NAT Gateway',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/create-nat-gateways',
    },
    {
      text: 'Managing and Assigning NAT Gateways',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/managing-nat-gateways',
    },
  ],
  moreInfo: {
    text: 'View additional NAT Gateways documentation',
    to: 'https://techdocs.akamai.com/cloud-computing/docs/nat-gateway',
  },
  title: 'Getting Started Guides',
};

export const linkAnalyticsEvent: ResourcesLinks['linkAnalyticsEvent'] = {
  action: 'Click:link',
  category: 'NAT Gateways landing page empty',
};
