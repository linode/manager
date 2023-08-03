import type {
  ResourcesHeaders,
  ResourcesLinks,
} from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';

export const headers: ResourcesHeaders = {
  description: '',
  subtitle: 'Create a private and isolated network.',
  title: 'VPCs',
};

export const linkAnalyticsEvent: ResourcesLinks['linkAnalyticsEvent'] = {
  action: 'Click:link',
  category: 'VPCs landing page empty',
};
