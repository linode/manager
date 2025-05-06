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
  description: '',
  subtitle: 'S3-compatible storage solution',
  title: 'Object Storage',
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
    {
      text: 'Overview of Object Storage',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/object-storage',
    },
    {
      text: 'Using the Linode CLI with Object Storage',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/using-the-linode-cli-with-object-storage',
    },
    {
      text: 'Use Object Storage with s3cmd',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/using-s3cmd-with-object-storage',
    },
    {
      text: 'Use Object Storage with s4cmd',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/using-s4cmd-with-object-storage',
    },
    {
      text: 'Use Object Storage with Cyberduck',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/using-cyberduck-with-object-storage',
    },
  ],
  moreInfo: {
    text: 'View additional Object Storage documentation',
    to: 'https://techdocs.akamai.com/cloud-computing/docs/object-storage',
  },
  title: 'Getting Started Guides',
};

export const youtubeLinkData: ResourcesLinkSection = {
  links: [
    {
      external: true,
      text: 'Getting Started with S3 Object Storage on Linode',
      to: 'https://www.youtube.com/watch?v=q88OKsr5l6c',
    },
    {
      external: true,
      text: 'S3 Object Storage Simply Explained',
      to: 'https://www.youtube.com/watch?v=7J3_NAq7fz0',
    },
    {
      external: true,
      text: 'Deploy a Static Website Using the Linode CLI and Object Storage',
      to: 'https://www.youtube.com/watch?v=ZfGyeJ8jYxI',
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
  category: 'Object Storage landing page empty',
};
