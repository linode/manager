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
  description:
    'Store your own custom Linux images, enabling you to rapidly deploy Linode Compute Instances preconfigured with the software and settings you require.',
  subtitle: '',
  title: 'Images',
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
    {
      to: 'https://www.linode.com/docs/products/tools/images/',
      text: 'Overview of Custom Images',
    },
    {
      to: 'https://www.linode.com/docs/products/tools/images/get-started/',
      text: 'Getting Started with Custom Images',
    },
    {
      to: 'https://www.linode.com/docs/products/tools/images/guides/capture-an-image/',
      text: 'Capture an Image from a Linode',
    },
    {
      to: 'https://www.linode.com/docs/products/tools/images/guides/upload-an-image/',
      text: 'Upload a Custom Image',
    },
  ],
  moreInfo: {
    to: 'https://www.linode.com/docs/products/tools/images/guides/',
    text: 'View additional Images guides',
  },
  title: 'DNS Manager Guides',
};

export const youtubeLinkData: ResourcesLinkSection = {
  links: [
    {
      to: 'https://www.youtube.com/watch?v=1nYhLui1urQ',
      text: 'How to use Linode Images | Learn how to Create, Upload, and Deploy Custom Images on Linode',
      external: true,
    },
    {
      to: 'https://www.youtube.com/watch?v=GdEFNHTCGqA',
      text: 'Custom Images on Linode | Create, Upload, and Deploy Custom iso Images to Deploy on Linode',
      external: true,
    },
    {
      to: 'https://www.youtube.com/watch?v=UNlJUzQrBBI',
      text: 'Using Images and Backups on Linode',
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
  category: 'Images landing page empty',
};
