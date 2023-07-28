import { docsLink } from 'src/utilities/emptyStateLandingUtils';

import type {
  ResourcesHeaders,
  ResourcesLinkSection,
  ResourcesLinks,
} from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';

export const headers: ResourcesHeaders = {
  description:
    'Scalable Layer 4 . and Layer 7 load balancer to manage and accelerate enterprise traffic between clients and your distributed applications and networks globally.',
  subtitle: 'BETA',
  title: 'Global Load Balancers',
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
    {
      text: 'Overview of Global Load Balancer',
      to: '',
    },
    {
      text: 'Getting started with Global Load Balancer',
      to: '',
    },
  ],
  moreInfo: {
    text: 'View additional Global Load Balancer Guides',
    to: docsLink,
  },
  title: 'Getting Started Guides',
};

export const youtubeLinkData: ResourcesLinkSection = {
  links: [
    {
      external: true,
      text: '',
      to: '',
    },
    {
      external: true,
      text: '',
      to: '',
    },
  ],
  moreInfo: {
    text: '',
    to: '',
  },
  title: 'Video Playlist',
};

export const linkAnalyticsEvent: ResourcesLinks['linkAnalyticsEvent'] = {
  action: 'Click:link',
  category: 'Load Balancer landing page empty',
};
