import * as React from 'react';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { sendEvent } from 'src/utilities/analytics';
import { StyledBucketIcon } from './StylesBucketIcon';
import { useHistory } from 'react-router-dom';
import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from './BucketLandingEmptyResourcesData';

export const BucketLandingEmptyState = () => {
  const history = useHistory();

  return (
    <ResourcesSection
      buttonProps={[
        {
          onClick: () => {
            sendEvent({
              category: linkAnalyticsEvent.category,
              action: 'Click:button',
              label: 'Create Bucket',
            });
            history.replace('/object-storage/buckets/create');
          },

          children: 'Create Bucket',
        },
      ]}
      gettingStartedGuidesData={gettingStartedGuides}
      headers={headers}
      icon={StyledBucketIcon}
      linkAnalyticsEvent={linkAnalyticsEvent}
      showTransferDisplay
      youtubeLinkData={youtubeLinkData}
    />
  );
};
