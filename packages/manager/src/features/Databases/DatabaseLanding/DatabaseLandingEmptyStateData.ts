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
    "Deploy popular database engines such as MySQL and PostgreSQL using Linode's performant, reliable, and fully managed database solution.",
  subtitle: 'Fully managed cloud database clusters',
  title: 'Databases',
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
    {
      to: 'https://www.linode.com/docs/products/databases/managed-databases/',
      text: 'Overview of Managed Databases',
    },
    {
      to:
        'https://www.linode.com/docs/products/databases/managed-databases/get-started/',
      text: 'Get Started with Managed Databases',
    },
    {
      to:
        'https://www.linode.com/docs/products/databases/managed-databases/guides/database-engines/',
      text: 'Choosing a Database Engine',
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
      to: 'https://www.youtube.com/watch?v=loEVtzUN2i8',
      text: 'Linode Managed Databases Overview',
    },
    {
      to: 'https://www.youtube.com/watch?v=dnV-6TtfYfY',
      text: 'How to Choose the Right Database for Your Application',
    },
    {
      to:
        'https://www.youtube.com/playlist?list=PLTnRtjQN5ieZl3kM_jqfnK98uqYeXbfmC',
      text: 'MySQL Beginner Series',
    },
  ],
  moreInfo: {
    to: youtubeChannelLink,
    text: youtubeMoreLinkText,
  },
  title: 'Video Playlist',
};

export const linkGAEvent: ResourcesLinks['linkGAEvent'] = {
  action: 'Click:link',
  category: 'Managed Databases landing page empty',
};
