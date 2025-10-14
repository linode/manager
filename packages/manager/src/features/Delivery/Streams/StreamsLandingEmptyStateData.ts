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
  links: [],
  moreInfo: {
    text: '',
    to: '',
  },
  title: '',
};
