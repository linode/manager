import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import ComputeIcon from 'src/assets/icons/entityIcons/compute.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { sendEvent } from 'src/utilities/analytics/utils';

import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from './ImagesLandingEmptyStateData';

export const ImagesLandingEmptyState = () => {
  const navigate = useNavigate();
  const { data: permissions } = usePermissions('account', ['create_image']);
  const canCreateImage = permissions?.create_image;

  return (
    <ResourcesSection
      buttonProps={[
        {
          children: 'Create Image',
          disabled: !canCreateImage,
          onClick: () => {
            sendEvent({
              action: 'Click:button',
              category: linkAnalyticsEvent.category,
              label: 'Create Image',
            });
            navigate({
              to: '/images/create',
            });
          },
          tooltipText: canCreateImage
            ? undefined
            : "You don't have permissions to create Images. Please contact your account administrator to request the necessary permissions.",
        },
      ]}
      gettingStartedGuidesData={gettingStartedGuides}
      headers={headers}
      icon={ComputeIcon}
      linkAnalyticsEvent={linkAnalyticsEvent}
      youtubeLinkData={youtubeLinkData}
    />
  );
};
