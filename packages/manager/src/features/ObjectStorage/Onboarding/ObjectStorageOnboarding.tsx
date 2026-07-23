import { sendEvent } from '@akamai/compute-ui-core/analytics';
import { styled } from '@mui/material/styles';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import StorageIcon from 'src/assets/icons/entityIcons/storage.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { getRestrictedResourceText } from 'src/features/Account/utils';

import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from './ObjectStorageOnboardingResources';

interface Props {
  isRestricted: boolean;
}

const StyledBucketIcon = styled(StorageIcon)(() => ({
  transform: 'scale(0.80)',
}));

export const ObjectStorageOnboarding = ({ isRestricted }: Props) => {
  const navigate = useNavigate();

  return (
    <ResourcesSection
      buttonProps={[
        {
          children: 'Create Bucket',
          disabled: isRestricted,
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
        {
          children: 'Create Access Key',
          disabled: isRestricted,
          onClick: () => {
            sendEvent({
              action: 'Click:button',
              category: linkAnalyticsEvent.category,
              label: 'Create Access Key',
            });
            navigate({ to: '/object-storage/access-keys/create' });
          },
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'Access Keys',
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
