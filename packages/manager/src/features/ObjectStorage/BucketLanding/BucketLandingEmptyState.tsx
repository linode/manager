import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { sendEvent } from 'src/utilities/analytics/utils';

import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from './BucketLandingEmptyResourcesData';
import { StyledBucketIcon } from './StylesBucketIcon';

export const BucketLandingEmptyState = () => {
  const navigate = useNavigate();
  const isBucketCreationRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_buckets',
  });

  return (
    <ResourcesSection
      buttonProps={[
        {
          children: 'Create Bucket',
          disabled: isBucketCreationRestricted,
          onClick: () => {
            sendEvent({
              action: 'Click:button',
              category: linkAnalyticsEvent.category,
              label: 'Create Bucket',
            });
            navigate({ to: '/object-storage/buckets/create' });
          },
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'Buckets',
          }),
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
