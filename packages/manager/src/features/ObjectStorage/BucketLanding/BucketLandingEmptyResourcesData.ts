import type {
  ResourcesHeaders,
  ResourcesLinks,
  ResourcesLinkSection,
} from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';
import {
  youtubeChannelLink,
  youtubeMoreLinkText,
} from 'src/utilities/emptyStateLandingUtils';

export const headers: ResourcesHeaders = {
  description: '',
  subtitle: 'S3-compatible storage solution',
  title: 'Object Storage',
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
    {
      to: 'https://www.linode.com/docs/products/storage/object-storage/',
      text: 'Overview of Object Storage',
    },
    {
      to: 'https://www.linode.com/docs/products/storage/object-storage/guides/linode-cli',
      text: 'Using the Linode CLI with Object Storage',
    },
    {
      to: 'https://www.linode.com/docs/products/storage/object-storage/guides/s3cmd',
      text: 'Use Object Storage with s3cmd',
    },
    {
      to: 'https://www.linode.com/docs/products/storage/object-storage/guides/s4cmd',
      text: 'Use Object Storage with s4cmd',
    },
    {
      to: 'https://www.linode.com/docs/products/storage/object-storage/guides/cyberduck',
      text: 'Use Object Storage with Cyberduck',
    },
  ],
  moreInfo: {
    to: 'https://www.linode.com/docs/products/storage/object-storage/',
    text: 'View additional Object Storage documentation',
  },
  title: 'Getting Started Guides',
};

export const youtubeLinkData: ResourcesLinkSection = {
  links: [
    {
      to: 'https://www.youtube.com/watch?v=q88OKsr5l6c',
      text: 'Getting Started with S3 Object Storage on Linode',
      external: true,
    },
    {
      to: 'https://www.youtube.com/watch?v=7J3_NAq7fz0',
      text: 'S3 Object Storage Simply Explained',
      external: true,
    },
    {
      to: 'https://www.youtube.com/watch?v=ZfGyeJ8jYxI',
      text: 'Deploy a Static Website Using the Linode CLI and Object Storage',
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
  category: 'Object Storage landing page empty',
};
