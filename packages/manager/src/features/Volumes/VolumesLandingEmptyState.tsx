import { sendEvent } from '@akamai/compute-ui-core/analytics';
import { styled } from '@mui/material/styles';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import StorageIcon from 'src/assets/icons/entityIcons/storage.svg';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from './VolumesLandingEmptyStateData';

const StyledBucketIcon = styled(StorageIcon)(() => ({
  transform: 'scale(0.80)',
}));

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
