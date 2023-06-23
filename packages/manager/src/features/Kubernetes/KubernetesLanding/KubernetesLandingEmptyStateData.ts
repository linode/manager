import type {
  ResourcesHeaders,
  ResourcesLinks,
  ResourcesLinkSection,
} from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';
import {
  docsLink,
  guidesMoreLinkText,
  youtubeChannelLink,
  youtubeMoreLinkText,
} from 'src/utilities/emptyStateLandingUtils';

export const headers: ResourcesHeaders = {
  description:
    'Deploy and scale your applications with the Linode Kubernetes Engine (LKE), a Kubernetes service equipped with a fully managed control plane.',
  subtitle: 'Fully managed Kubernetes infrastructure',
  title: 'Kubernetes',
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
    {
      to: 'https://www.linode.com/docs/products/compute/kubernetes/get-started/',
      text: 'Get Started with the Linode Kubernetes Engine (LKE)',
    },
    {
      to: 'https://www.linode.com/docs/products/compute/kubernetes/guides/create-lke-cluster',
      text: 'Create and Administer a Kubernetes Cluster on LKE',
    },
    {
      to: 'https://www.linode.com/docs/guides/using-the-kubernetes-dashboard-on-lke/',
      text: 'Using the Kubernetes Dashboard',
    },
    {
      to: 'https://www.linode.com/docs/guides/beginners-guide-to-kubernetes/',
      text: 'A Beginner\u{2019}s Guide to Kubernetes',
    },
  ],
  moreInfo: {
    to: docsLink,
    text: guidesMoreLinkText,
  },
  title: 'Getting Started Guides',
};

export const youtubeLinkData: ResourcesLinkSection = {
  links: [
    {
      to: 'https://www.youtube.com/watch?v=erthAqqdD_c',
      text: 'Easily Deploy a Kubernetes Cluster on LKE',
      external: true,
    },
    {
      to: 'https://www.youtube.com/watch?v=VYUr_WvXCsY',
      text: 'Enable High Availability on an LKE Cluster',
      external: true,
    },
    {
      to: 'https://www.youtube.com/watch?v=odPmyT5DONg',
      text: 'Use a Load Balancer with an LKE Cluster',
      external: true,
    },
    {
      to: 'https://www.youtube.com/watch?v=1564_DrFRSE',
      text: 'Use TOBS (The Observability Stack) with LKE',
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
  category: 'Kubernetes landing page empty',
};
