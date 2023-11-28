import { AGLB_DOCS } from '../constants';

import type {
  ResourcesHeaders,
  ResourcesLinkSection,
  ResourcesLinks,
} from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';

export const headers: ResourcesHeaders = {
  description:
    'Scalable Layer 4 and Layer 7 load balancer to route and manage enterprise traffic between clients and your distributed applications and networks globally.',
  subtitle: 'BETA',
  title: 'Global Load Balancers',
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
    {
      text: 'Overview',
      to: AGLB_DOCS.Overview,
    },
    {
      text: 'Getting Started',
      to: AGLB_DOCS.GettingStarted,
    },
  ],
  moreInfo: {
    text: 'Guides',
    to: AGLB_DOCS.Guides,
  },
  title: 'Getting Started Guides',
};

export const resourcesLinks: ResourcesLinkSection = {
  links: [
    {
      text: 'Resources',
      to: AGLB_DOCS.Resouces,
    },
    {
      text: 'Developers',
      to: AGLB_DOCS.Developers,
    },
  ],
  moreInfo: {
    text: 'Guides',
    to: AGLB_DOCS.Guides,
  },
  title: 'Resources',
};

export const linkAnalyticsEvent: ResourcesLinks['linkAnalyticsEvent'] = {
  action: 'Click:link',
  category: 'Load Balancer landing page empty',
};
