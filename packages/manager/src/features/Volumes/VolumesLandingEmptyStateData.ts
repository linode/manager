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
  subtitle: 'NVM block storage service',
  title: 'Volumes',
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
    {
      to: 'https://www.linode.com/docs/products/storage/block-storage/',
      text: 'Overview of Block Storage',
    },
    {
      to: 'https://www.linode.com/docs/products/storage/block-storage/guides/',
      text: 'Create and Manage Block Storage Volumes',
    },
    {
      to:
        'https://www.linode.com/docs/products/storage/block-storage/guides/configure-volume/',
      text: 'Configure a Volume on a Compute Instance',
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
      to: 'https://www.youtube.com/watch?v=7ti25oK7UMA',
      text: 'How to Use Block Storage with Your Linode',
      external: true,
    },
    {
      to: 'https://www.youtube.com/watch?v=8G0cNZZIxNc',
      text: 'Block Storage Vs Object Storage',
      external: true,
    },
    {
      to: 'https://www.youtube.com/watch?v=Z9jZv_IHO2s',
      text:
        'How to use Block Storage to Increase Space on Your Nextcloud Instance',
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
  category: 'Volumes landing page empty',
};
