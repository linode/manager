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
  description:
    'Run custom scripts to install and configure software when initializing Linode Compute Instances',

  subtitle: 'Automate deployment scripts',
  title: 'StackScripts',
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
    {
      text: 'Getting Started with StackScripts',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-stackscripts',
    },
    {
      text: 'Create a StackScript',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/create-a-stackscript',
    },
    {
      text: 'Write a Custom Script for Use with StackScripts',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/write-a-custom-script-for-use-with-stackscripts',
    },
  ],
  moreInfo: {
    text: 'View additional StackScripts documentation',
    to: 'https://techdocs.akamai.com/cloud-computing/docs/stackscripts',
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
