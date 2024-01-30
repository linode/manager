import { PLACEMENT_GROUP_LABEL } from 'src/features/PlacementGroups/constants';

import type {
  ResourcesHeaders,
  ResourcesLinkSection,
  ResourcesLinks,
} from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';

export const headers: ResourcesHeaders = {
  description:
    'Control the physical placement or distribution of virtual machines (VMs) instances within a data center or availability zone.',
  subtitle: '',
  title: PLACEMENT_GROUP_LABEL,
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
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
  category: 'Placement Groups landing page empty',
};
