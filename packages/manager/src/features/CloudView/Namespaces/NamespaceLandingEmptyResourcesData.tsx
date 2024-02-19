import type {
  ResourcesHeaders,
  ResourcesLinkSection,
  ResourcesLinks,
} from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';

export const headers: ResourcesHeaders = {
  description:
    'Create Namespace to store and process metrics from your service for your customers',
  subtitle: '',
  title: '',
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
    {
      text: '',
      to: '',
    },
    {
      text: '',
      to: '',
    },
    {
      text: '',
      to: '',
    },
  ],
  moreInfo: {
    text: '',
    to: '',
  },
  title: '',
};

export const linkAnalyticsEvent: ResourcesLinks['linkAnalyticsEvent'] = {
  action: 'Click:link',
  category: 'Namespace landing page empty',
};
