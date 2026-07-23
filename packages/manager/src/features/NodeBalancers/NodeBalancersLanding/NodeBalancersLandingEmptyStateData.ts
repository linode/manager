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
      pendoId: 'NodeBalancers Landing Empty-Docs Getting Started',
    },
    {
      text: 'Create a NodeBalancer',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/create-a-nodebalancer',
      pendoId: 'NodeBalancers Landing Empty-Docs Create NodeBalancer',
    },
    {
      text: 'Configuration Options for NodeBalancers',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/configuration-options-for-nodebalancers',
      pendoId: 'NodeBalancers Landing Empty-Docs Configuration',
    },
  ],
  moreInfo: {
    text: 'View additional NodeBalancer documentation',
    to: ' https://techdocs.akamai.com/cloud-computing/docs/nodebalancer',
    pendoId: 'NodeBalancers Landing Empty-Additional NodeBalancers Docs',
  },
  title: 'Getting Started Guides',
};

export const youtubeLinkData: ResourcesLinkSection = {
  links: [
    {
      external: true,
      text: 'Getting Started With NodeBalancers | How To Prepare For High Server Traffic',
      to: 'https://www.youtube.com/watch?v=JlXgl_rtM_s',
      pendoId: 'NodeBalancers Landing Empty-Video Getting Started',
    },
    {
      external: true,
      text: 'Linode NodeBalancers Explained | Manage Scale with Transparent Load Distribution',
      to: 'https://www.youtube.com/watch?v=U6xxgydIG9w',
      pendoId: 'NodeBalancers Landing Empty-Video Linode NB Explained',
    },
    {
      external: true,
      text: 'Load Balancing on an LKE Kubernetes Cluster',
      to: 'https://www.youtube.com/watch?v=odPmyT5DONg',
      pendoId: 'NodeBalancers Landing Empty-Video Load Balancing on LKE',
    },
  ],
  moreInfo: {
    text: youtubeMoreLinkText,
    to: youtubeChannelLink,
    pendoId: 'NodeBalancers Landing Empty-Additional NodeBalancers Docs',
  },
  title: 'Video Playlist',
};

export const linkAnalyticsEvent: ResourcesLinks['linkAnalyticsEvent'] = {
  action: 'Click:link',
  category: 'NodeBalancers landing page empty',
};
