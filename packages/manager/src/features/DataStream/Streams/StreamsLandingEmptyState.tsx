import { useNavigate } from '@tanstack/react-router';
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

export const StreamsLandingEmptyState = () => {
  const navigate = useNavigate();

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
              navigate({ to: '/datastream/streams/create' });
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
