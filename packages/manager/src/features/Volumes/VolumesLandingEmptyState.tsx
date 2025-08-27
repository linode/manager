import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { StyledBucketIcon } from 'src/features/ObjectStorage/BucketLanding/StylesBucketIcon';
import { sendEvent } from 'src/utilities/analytics/utils';

import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from './VolumesLandingEmptyStateData';

export const VolumesLandingEmptyState = () => {
  const navigate = useNavigate();
  const { data: permissions } = usePermissions('account', ['create_volume']);

  return (
    <>
      <DocumentTitleSegment segment="Volumes" />
      <ResourcesSection
        buttonProps={[
          {
            children: 'Create Volume',
            disabled: !permissions?.create_volume,
            onClick: () => {
              sendEvent({
                action: 'Click:button',
                category: linkAnalyticsEvent.category,
                label: 'Create Volume',
              });
              navigate({ to: '/volumes/create' });
            },
            tooltipText: getRestrictedResourceText({
              action: 'create',
              isSingular: false,
              resourceType: 'Volumes',
            }),
          },
        ]}
        gettingStartedGuidesData={gettingStartedGuides}
        headers={headers}
        icon={StyledBucketIcon}
        linkAnalyticsEvent={linkAnalyticsEvent}
        youtubeLinkData={youtubeLinkData}
      />
    </>
  );
};
