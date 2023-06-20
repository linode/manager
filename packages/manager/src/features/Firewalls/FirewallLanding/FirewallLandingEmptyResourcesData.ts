import {
  youtubeChannelLink,
  youtubeMoreLinkText,
} from 'src/utilities/emptyStateLandingUtils';
import type {
  ResourcesHeaders,
  ResourcesLinkSection,
  ResourcesLinks,
} from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';

export const headers: ResourcesHeaders = {
  description:
    'Control network traffic to and from Linode Compute Instances with a simple management interface',

  subtitle: 'Secure cloud-based firewall',
  title: 'Firewalls',
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
    {
      to:
        'https://www.linode.com/docs/products/networking/cloud-firewall/get-started/',
      text: 'Getting Started with Cloud Firewalls',
    },
    {
      to:
        'https://www.linode.com/docs/products/networking/cloud-firewall/guides/manage-firewall-rules/',
      text: 'Manage Firewall Rules',
    },
    {
      to:
        'https://www.linode.com/docs/products/networking/cloud-firewall/guides/comparing-firewalls/',
      text: 'Comparing Cloud Firewalls to Linux Firewall Software',
    },
  ],
  moreInfo: {
    to:
      'https://www.linode.com/docs/products/networking/cloud-firewall/guides/',
    text: 'View additional Firewalls guides',
  },
  title: 'Getting Started Guides',
};

export const youtubeLinkData: ResourcesLinkSection = {
  links: [
    {
      to: 'https://www.youtube.com/watch?v=GsUUtsI_RSA',
      text:
        'Linode Cloud Firewall Explained | Clear and Intuitive Network Control to and from All your Servers',
      external: true,
    },
    {
      to: 'https://www.youtube.com/watch?v=H7wM5mDI1-k',
      text: 'Simple Scalable Network Security | Linode Cloud Firewall',
      external: true,
    },
  ],
  moreInfo: {
    to: youtubeChannelLink,
    text: youtubeMoreLinkText,
  },
  title: 'Video Playlist',
};

export const linkAnalyticsEvent: ResourcesLinks['linkAnalyticsEvent'] = {
  action: 'Click:link',
  category: 'Firewall landing page empty',
};
