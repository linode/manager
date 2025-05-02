import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import NetworkIcon from 'src/assets/icons/entityIcons/networking.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { gettingStartedGuides } from 'src/features/VPCs/VPCLanding/VPCLandingEmptyStateData';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { sendEvent } from 'src/utilities/analytics/utils';

import { headers, linkAnalyticsEvent } from './VPCEmptyStateData';

export const VPCEmptyState = () => {
  const navigate = useNavigate();

  const isVPCCreationRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_vpcs',
  });

  return (
    <ResourcesSection
      buttonProps={[
        {
          children: 'Create VPC',
          disabled: isVPCCreationRestricted,
          onClick: () => {
            sendEvent({
              action: 'Click:button',
              category: linkAnalyticsEvent.category,
              label: 'Create VPC',
            });
            navigate({ to: '/vpcs/create' });
          },
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'VPCs',
          }),
        },
      ]}
      gettingStartedGuidesData={gettingStartedGuides}
      headers={headers}
      icon={NetworkIcon}
      linkAnalyticsEvent={linkAnalyticsEvent}
      wide
    />
  );
};
