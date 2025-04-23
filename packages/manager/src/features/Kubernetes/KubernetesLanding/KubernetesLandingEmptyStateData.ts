import {
  docsLink,
  guidesMoreLinkText,
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
    'Deploy and scale your applications with the Linode Kubernetes Engine (LKE), a Kubernetes service equipped with a fully managed control plane.',
  subtitle: 'Fully managed Kubernetes infrastructure',
  title: 'Kubernetes',
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
    {
      text: 'Get Started with the Linode Kubernetes Engine (LKE)',
      to:
        'https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-lke-linode-kubernetes-engine',
    },
    {
      text: 'Create and Administer a Kubernetes Cluster on LKE',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/create-a-cluster',
    },
    {
      text: 'Using the Kubernetes Dashboard',
      to:
        'https://techdocs.akamai.com/cloud-computing/docs/an-overview-of-the-kubernetes-dashboard-on-lke',
    },
    {
      text: 'A Beginner\u{2019}s Guide to Kubernetes',
      to: 'https://www.linode.com/docs/guides/beginners-guide-to-kubernetes/',
    },
  ],
  moreInfo: {
    text: guidesMoreLinkText,
    to: docsLink,
  },
  title: 'Getting Started Guides',
};

export const youtubeLinkData: ResourcesLinkSection = {
  links: [
    {
      external: true,
      text: 'Easily Deploy a Kubernetes Cluster on LKE',
      to: 'https://www.youtube.com/watch?v=erthAqqdD_c',
    },
    {
      external: true,
      text: 'Enable High Availability on an LKE Cluster',
      to: 'https://www.youtube.com/watch?v=VYUr_WvXCsY',
    },
    {
      external: true,
      text: 'Use a Load Balancer with an LKE Cluster',
      to: 'https://www.youtube.com/watch?v=odPmyT5DONg',
    },
    {
      external: true,
      text: 'Use TOBS (The Observability Stack) with LKE',
      to: 'https://www.youtube.com/watch?v=1564_DrFRSE',
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
  category: 'Kubernetes landing page empty',
};
