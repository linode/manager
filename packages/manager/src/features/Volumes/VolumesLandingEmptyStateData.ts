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
    'Attach scalable, fault-tolerant, and performant block storage volumes to your Linode Compute Instances or Kubernetes Clusters.',
  subtitle: 'NVMe block storage service',
  title: 'Volumes',
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
    {
      text: 'Overview of Block Storage',
      to: 'https://www.linode.com/docs/products/storage/block-storage/',
    },
    {
      text: 'Create and Manage Block Storage Volumes',
      to: 'https://www.linode.com/docs/products/storage/block-storage/guides/',
    },
    {
      text: 'Configure a Volume on a Compute Instance',
      to:
        'https://www.linode.com/docs/products/storage/block-storage/guides/configure-volume/',
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
      text: 'How to Use Block Storage with Your Linode',
      to: 'https://www.youtube.com/watch?v=7ti25oK7UMA',
    },
    {
      external: true,
      text: 'Block Storage Vs Object Storage',
      to: 'https://www.youtube.com/watch?v=8G0cNZZIxNc',
    },
    {
      external: true,
      text:
        'How to use Block Storage to Increase Space on Your Nextcloud Instance',
      to: 'https://www.youtube.com/watch?v=Z9jZv_IHO2s',
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
  category: 'Volumes landing page empty',
};
