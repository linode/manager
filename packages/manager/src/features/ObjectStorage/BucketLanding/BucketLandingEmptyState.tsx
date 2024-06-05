import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { sendEvent } from 'src/utilities/analytics/utils';

import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from './BucketLandingEmptyResourcesData';
import { StyledBucketIcon } from './StylesBucketIcon';

export const BucketLandingEmptyState = () => {
  const history = useHistory();

  return (
    <ResourcesSection
      buttonProps={[
        {
          children: 'Create Bucket',

          onClick: () => {
            sendEvent({
              action: 'Click:button',
              category: linkAnalyticsEvent.category,
              label: 'Create Bucket',
            });
            history.replace('/object-storage/buckets/create');
          },
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
