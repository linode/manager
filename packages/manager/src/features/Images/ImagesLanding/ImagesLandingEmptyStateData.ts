import {
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
    'Store your own custom Linux images, enabling you to rapidly deploy Linode Compute Instances preconfigured with the software and settings you require.',
  subtitle: '',
  title: 'Images',
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
    {
      text: 'Overview of Custom Images',
      to: 'https://www.linode.com/docs/products/tools/images/',
    },
    {
      text: 'Getting Started with Custom Images',
      to: 'https://www.linode.com/docs/products/tools/images/get-started/',
    },
    {
      text: 'Capture an Image from a Linode',
      to:
        'https://www.linode.com/docs/products/tools/images/guides/capture-an-image/',
    },
    {
      text: 'Upload a Custom Image',
      to:
        'https://www.linode.com/docs/products/tools/images/guides/upload-an-image/',
    },
  ],
  moreInfo: {
    text: 'View additional Images guides',
    to: 'https://www.linode.com/docs/products/tools/images/guides/',
  },
  title: 'Getting Started Guides',
};

export const youtubeLinkData: ResourcesLinkSection = {
  links: [
    {
      external: true,
      text:
        'How to use Linode Images | Learn how to Create, Upload, and Deploy Custom Images on Linode',
      to: 'https://www.youtube.com/watch?v=1nYhLui1urQ',
    },
    {
      external: true,
      text:
        'Custom Images on Linode | Create, Upload, and Deploy Custom iso Images to Deploy on Linode',
      to: 'https://www.youtube.com/watch?v=GdEFNHTCGqA',
    },
    {
      external: true,
      text: 'Using Images and Backups on Linode',
      to: 'https://www.youtube.com/watch?v=UNlJUzQrBBI',
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
  category: 'Images landing page empty',
};
