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
  links: [],
  moreInfo: {
    text: '',
    to: '',
  },
  title: '',
};
