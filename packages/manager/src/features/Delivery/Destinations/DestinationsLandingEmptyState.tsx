import * as React from 'react';

import MonitorIcon from 'src/assets/icons/entityIcons/monitor.svg';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
} from 'src/features/Delivery/Destinations/DestinationsLandingEmptyStateData';
import { sendEvent } from 'src/utilities/analytics/utils';

interface DestinationsLandingEmptyStateProps {
  navigateToCreate: () => void;
}

export const DestinationsLandingEmptyState = (
  props: DestinationsLandingEmptyStateProps
) => {
  const { navigateToCreate } = props;

  return (
    <>
      <DocumentTitleSegment segment="Destinations" />
      <ResourcesSection
        buttonProps={[
          {
            children: 'Create Destination',
            onClick: () => {
              sendEvent({
                action: 'Click:button',
                category: linkAnalyticsEvent.category,
                label: 'Create Destination',
              });
              navigateToCreate();
            },
          },
        ]}
        gettingStartedGuidesData={gettingStartedGuides}
        headers={headers}
        icon={MonitorIcon}
        linkAnalyticsEvent={linkAnalyticsEvent}
      />
    </>
  );
};
