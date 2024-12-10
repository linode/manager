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
      text: 'Overview of Managed Databases',
      to:
        'https://techdocs.akamai.com/cloud-computing/docs/aiven-database-clusters',
    },
    {
      text: 'Get Started with Managed Databases',
      to:
        'https://techdocs.akamai.com/cloud-computing/docs/get-started-new-clusters',
    },
    {
      text: 'Choosing a Database Engine',
      to:
        'https://techdocs.akamai.com/cloud-computing/docs/aiven-database-engines',
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
      text: 'Linode Managed Databases Overview',
      to: 'https://www.youtube.com/watch?v=loEVtzUN2i8',
    },
    {
      external: true,
      text: 'How to Choose the Right Database for Your Application',
      to: 'https://www.youtube.com/watch?v=dnV-6TtfYfY',
    },
    {
      external: true,
      text: 'MySQL Beginner Series',
      to:
        'https://www.youtube.com/playlist?list=PLTnRtjQN5ieZl3kM_jqfnK98uqYeXbfmC',
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
  category: 'Managed Databases landing page empty',
};
