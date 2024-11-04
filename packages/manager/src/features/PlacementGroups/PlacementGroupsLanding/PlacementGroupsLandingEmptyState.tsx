import * as React from 'react';

import LinodeIcon from 'src/assets/icons/entityIcons/linode.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { sendEvent } from 'src/utilities/analytics/utils';

import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
} from './PlacementGroupsLandingEmptyStateData';

interface Props {
  disabledCreateButton: boolean;
  openCreatePlacementGroupDrawer: () => void;
}

export const PlacementGroupsLandingEmptyState = ({
  disabledCreateButton,
  openCreatePlacementGroupDrawer,
}: Props) => {
  return (
    <ResourcesSection
      buttonProps={[
        {
          children: 'Create Placement Group',
          disabled: disabledCreateButton,
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
      icon={LinodeIcon}
      linkAnalyticsEvent={linkAnalyticsEvent}
    />
  );
};
