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
    'Add high availability and horizontal scaling to web applications hosted on Linode Compute Instances.',
  subtitle: 'Cloud-based load balancing service',
  title: 'NodeBalancers',
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
    {
      text: 'Getting Started with NodeBalancers',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-nodebalancers',
    },
    {
      text: 'Create a NodeBalancer',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/create-a-nodebalancer',
    },
    {
      text: 'Configuration Options for NodeBalancers',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/configuration-options-for-nodebalancers',
    },
  ],
  moreInfo: {
    text: 'View additional NodeBalancer documentation',
    to: ' https://techdocs.akamai.com/cloud-computing/docs/nodebalancer',
  },
  title: 'Getting Started Guides',
};

export const youtubeLinkData: ResourcesLinkSection = {
  links: [
    {
      external: true,
      text: 'Getting Started With NodeBalancers | How To Prepare For High Server Traffic',
      to: 'https://www.youtube.com/watch?v=JlXgl_rtM_s',
    },
    {
      external: true,
      text: 'Linode NodeBalancers Explained | Manage Scale with Transparent Load Distribution',
      to: 'https://www.youtube.com/watch?v=U6xxgydIG9w',
    },
    {
      external: true,
      text: 'Load Balancing on an LKE Kubernetes Cluster',
      to: 'https://www.youtube.com/watch?v=odPmyT5DONg',
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
  category: 'NodeBalancers landing page empty',
};
