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
      text: 'Getting Started with StackScripts',
      to:
        'https://www.linode.com/docs/products/tools/stackscripts/get-started/',
    },
    {
      text: 'Create a StackScript',
      to:
        'https://www.linode.com/docs/products/tools/stackscripts/guides/create/',
    },
    {
      text: 'Write a Custom Script for Use with StackScripts',
      to:
        'https://www.linode.com/docs/products/tools/stackscripts/guides/write-a-custom-script/',
    },
  ],
  moreInfo: {
    text: 'View additional StackScripts documentation',
    to: 'https://www.linode.com/docs/products/tools/stackscripts/ ',
  },
  title: 'Getting Started Guides',
};

export const youtubeLinkData: ResourcesLinkSection = {
  links: [
    {
      external: true,
      text: 'Automate Server Deployments Using Stackscripts',
      to: 'https://www.youtube.com/watch?v=nygChMc1hX4',
    },
    {
      external: true,
      text: 'Shell Scripts Explained',
      to: 'https://www.youtube.com/watch?v=EbyA5rZwyRw',
    },
    {
      external: true,
      text: ' Linux for Programmers #7 | Environment Variables',
      to: 'https://www.youtube.com/watch?v=yM8v5i2Qjgg',
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
  category: 'StackScripts landing page empty',
};
