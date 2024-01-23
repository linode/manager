import * as React from 'react';

import PlacementGroups from 'src/assets/icons/entityIcons/placement-groups.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { sendEvent } from 'src/utilities/analytics';

import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
} from './PlacementGroupsLandingEmptyStateData';

interface Props {
  openCreatePlacementGroupDrawer: () => void;
}

export const PlacementGroupsLandingEmptyState = (props: Props) => {
  const { openCreatePlacementGroupDrawer } = props;

  return (
    <ResourcesSection
      buttonProps={[
        {
          children: 'Create Placement Groups',
          onClick: () => {
            sendEvent({
              action: 'Click:button',
              category: linkAnalyticsEvent.category,
              label: 'Create Placement Group',
            });
            openCreatePlacementGroupDrawer();
          },
        },
      ]}
      gettingStartedGuidesData={gettingStartedGuides}
      headers={headers}
      icon={PlacementGroups}
      linkAnalyticsEvent={linkAnalyticsEvent}
    />
  );
};
