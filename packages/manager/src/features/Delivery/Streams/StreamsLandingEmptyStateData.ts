import {
  docsLink,
  guidesMoreLinkText,
} from 'src/utilities/emptyStateLandingUtils';

import type {
  ResourcesHeaders,
  ResourcesLinks,
  ResourcesLinkSection,
} from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';

export const headers: ResourcesHeaders = {
  title: 'Streams',
  subtitle: '',
  description: 'Create a stream and configure delivery of cloud logs',
};

export const linkAnalyticsEvent: ResourcesLinks['linkAnalyticsEvent'] = {
  action: 'Click:link',
  category: 'Streams landing page empty',
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
    {
      text: 'Getting started guide',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/log-delivery',
    },
  ],
  moreInfo: {
    text: guidesMoreLinkText,
    to: docsLink,
  },
  title: 'Getting Started Guides',
};
