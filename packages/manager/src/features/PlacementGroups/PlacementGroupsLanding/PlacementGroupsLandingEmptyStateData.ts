import { PLACEMENT_GROUP_LABEL } from 'src/features/PlacementGroups/constants';

import type {
  ResourcesHeaders,
  ResourcesLinkSection,
  ResourcesLinks,
} from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';

export const headers: ResourcesHeaders = {
  description:
    'Control the physical placement or distribution of Linode instances within a data center or availability zone.',
  subtitle: '',
  title: PLACEMENT_GROUP_LABEL,
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
    {
      text: 'Overview of Placement Groups',
      to:
        'https://www.linode.com/docs/products/compute/compute-instances/guides/placement-groups/',
    },
  ],
  moreInfo: {
    text: 'Check out all our Docs',
    to: 'https://www.linode.com/docs/',
  },
  title: 'Getting Started Guides',
};

export const linkAnalyticsEvent: ResourcesLinks['linkAnalyticsEvent'] = {
  action: 'Click:link',
  category: 'Placement Groups landing page empty',
};
