import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import ComputeIcon from 'src/assets/icons/entityIcons/compute.svg';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
} from 'src/features/DataStream/Destinations/DestinationsLandingEmptyStateData';
import { sendEvent } from 'src/utilities/analytics/utils';

export const DestinationsLandingEmptyState = () => {
  const navigate = useNavigate();

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
              navigate({ to: '/datastream/destinations/create' });
            },
          },
        ]}
        gettingStartedGuidesData={gettingStartedGuides}
        headers={headers}
        icon={ComputeIcon}
        linkAnalyticsEvent={linkAnalyticsEvent}
      />
    </>
  );
};
