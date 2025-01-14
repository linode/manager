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
      to: 'https://techdocs.akamai.com/cloud-computing/docs/block-storage',
    },
    {
      text: 'Create and Manage Block Storage Volumes',
      to:
        'https://techdocs.akamai.com/cloud-computing/docs/manage-block-storage-volumes',
    },
    {
      text: 'Configure a Volume on a Compute Instance',
      to:
        'https://techdocs.akamai.com/cloud-computing/docs/configure-and-mount-a-volume',
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
