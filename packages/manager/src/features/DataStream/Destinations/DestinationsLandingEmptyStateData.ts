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
  title: 'Destinations',
  subtitle: '',
  description: 'Create a destination for cloud logs',
};

export const linkAnalyticsEvent: ResourcesLinks['linkAnalyticsEvent'] = {
  action: 'Click:link',
  category: 'Destinations landing page empty',
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
    {
      // TODO: Change the link and text when proper documentation is ready
      text: 'Getting started guide',
      to: 'https://techdocs.akamai.com/cloud-computing/docs',
    },
  ],
  moreInfo: {
    text: guidesMoreLinkText,
    to: docsLink,
  },
  title: 'Getting Started Guides',
};
