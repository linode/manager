import * as React from 'react';

import ComputeIcon from 'src/assets/icons/entityIcons/compute.svg';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { sendEvent } from 'src/utilities/analytics/utils';

import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
} from './StreamsLandingEmptyStateData';

interface StreamsLandingEmptyStateProps {
  navigateToCreate: () => void;
}

export const StreamsLandingEmptyState = (
  props: StreamsLandingEmptyStateProps
) => {
  const { navigateToCreate } = props;

  return (
    <>
      <DocumentTitleSegment segment="Streams" />
      <ResourcesSection
        buttonProps={[
          {
            children: 'Create Stream',
            onClick: () => {
              sendEvent({
                action: 'Click:button',
                category: linkAnalyticsEvent.category,
                label: 'Create Stream',
              });
              navigateToCreate();
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
