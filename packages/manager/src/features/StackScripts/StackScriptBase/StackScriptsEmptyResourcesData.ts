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
    'Run custom scripts to install and configure software when initializing Linode Compute Instances',

  subtitle: 'Automate deployment scripts',
  title: 'StackScripts',
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
    {
      to:
        'https://www.linode.com/docs/products/tools/stackscripts/get-started/',
      text: 'Getting Started with StackScripts',
    },
    {
      to:
        'https://www.linode.com/docs/products/tools/stackscripts/guides/create/',
      text: 'Create a StackScript',
    },
    {
      to:
        'https://www.linode.com/docs/products/tools/stackscripts/guides/write-a-custom-script/',
      text: 'Write a Custom Script for Use with StackScripts',
    },
  ],
  moreInfo: {
    to: 'https://www.linode.com/docs/products/tools/stackscripts/ ',
    text: 'View additional StackScripts documentation',
  },
  title: 'Getting Started Guides',
};

export const youtubeLinkData: ResourcesLinkSection = {
  links: [
    {
      to: 'https://www.youtube.com/watch?v=nygChMc1hX4',
      text: 'Automate Server Deployments Using Stackscripts',
      external: true,
    },
    {
      to: 'https://www.youtube.com/watch?v=EbyA5rZwyRw',
      text: 'Shell Scripts Explained',
      external: true,
    },
    {
      to: 'https://www.youtube.com/watch?v=yM8v5i2Qjgg',
      text: ' Linux for Programmers #7 | Environment Variables',
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
  category: 'StackScripts landing page empty',
};
