import {
  youtubeChannelLink,
  youtubeMoreLinkText,
} from 'src/utilities/emptyStateLandingUtils';

import type {
  ResourcesHeaders,
  ResourcesLinks,
  ResourcesLinkSection,
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
      text: 'Getting Started with Cloud Firewalls',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-cloud-firewalls',
    },
    {
      text: 'Manage Firewall Rules',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/manage-firewall-rules',
    },
    {
      text: 'Comparing Cloud Firewalls to Linux Firewall Software',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/comparing-cloud-firewalls-to-linux-firewall-software',
    },
  ],
  moreInfo: {
    text: 'View additional Firewalls guides',
    to: 'https://techdocs.akamai.com/cloud-computing/docs/cloud-firewall',
  },
  title: 'Getting Started Guides',
};

export const youtubeLinkData: ResourcesLinkSection = {
  links: [
    {
      external: true,
      text: 'Linode Cloud Firewall Explained | Clear and Intuitive Network Control to and from All your Servers',
      to: 'https://www.youtube.com/watch?v=GsUUtsI_RSA',
    },
    {
      external: true,
      text: 'Simple Scalable Network Security | Linode Cloud Firewall',
      to: 'https://www.youtube.com/watch?v=H7wM5mDI1-k',
    },
  ],
  moreInfo: {
    text: youtubeMoreLinkText,
    to: youtubeChannelLink,
  },
  title: 'Video Playlist',
};

export const linkAnalyticsEvent: ResourcesLinks['linkAnalyticsEvent'] = {
  action: 'Click:link',
  category: 'Firewall landing page empty',
};
