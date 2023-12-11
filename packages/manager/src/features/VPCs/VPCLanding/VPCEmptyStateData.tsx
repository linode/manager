import { VPC_LABEL } from 'src/features/VPCs/constants';

import type {
  ResourcesHeaders,
  ResourcesLinks,
} from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';

export const headers: ResourcesHeaders = {
  description:
    'Enable cloud resources to privately communicate with each other, the internet, and other private networks.',
  subtitle: 'Create a private and isolated network',
  title: VPC_LABEL,
};

export const linkAnalyticsEvent: ResourcesLinks['linkAnalyticsEvent'] = {
  action: 'Click:link',
  category: 'VPCs landing page empty',
};
