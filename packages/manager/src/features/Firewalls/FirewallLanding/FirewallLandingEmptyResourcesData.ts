import {
  youtubeChannelLink,
  youtubeMoreLinkText,
} from 'src/utilities/emptyStateLandingUtils';
import type {
  ResourcesHeaders,
  ResourcesLinksProps,
  ResourcesLinkSectionProps,
} from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';

export const headers: ResourcesHeaders = {
  title: 'Firewalls',
  subtitle: 'Secure cloud-based firewall',
  description:
    'Control network traffic to and from Linode Compute Instances with a simple management interface',
};

export const gettingStartedGuides: ResourcesLinkSectionProps = {
  title: 'Getting Started Guides',
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
};

export const youtubeLinkData: ResourcesLinkSectionProps = {
  title: 'Video Playlist',
  links: [
    {
      to: 'https://www.youtube.com/watch?v=GsUUtsI_RSA',
      text:
        'Linode Cloud Firewall Explained | Clear and Intuitive Network Control to and from All your Servers',
      external: true,
    },
    {
      to: 'https://www.youtube.com/watch?v=GsUUtsI_RSA',
      text: 'Simple Scalable Network Security | Linode Cloud Firewall',
      external: true,
    },
  ],
  moreInfo: {
    to: youtubeChannelLink,
    text: youtubeMoreLinkText,
  },
};

export const linkGAEvent: ResourcesLinksProps['linkGAEvent'] = {
  category: 'Firewall landing page empty',
  action: 'Click:link',
};
