import {
  docsLink,
  guidesMoreLinkText,
  youtubeChannelLink,
  youtubeMoreLinkText,
} from 'src/utilities/emptyStateLandingUtils';
import type {
  ResourcesHeaders,
  ResourcesLinksProps,
  ResourcesLinkSectionProps,
} from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';

export const headers: ResourcesHeaders = {
  title: 'Volumes',
  subtitle: 'NVM block storage service',
  description:
    'Attach scalable, fault-tolerant, and performant block storage volumes to your Linode Compute Instances or Kubernetes Clusters.',
};

export const gettingStartedGuides: ResourcesLinkSectionProps = {
  title: 'Getting Started Guides',
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
};

export const youtubeLinkData: ResourcesLinkSectionProps = {
  title: 'Video Playlist',
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
};

export const linkGAEvent: ResourcesLinksProps['linkGAEvent'] = {
  category: 'Volumes landing page empty',
  action: 'Click:link',
};
