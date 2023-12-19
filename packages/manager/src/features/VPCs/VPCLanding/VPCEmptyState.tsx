import * as React from 'react';
import { useHistory } from 'react-router-dom';

import VPC from 'src/assets/icons/entityIcons/vpc.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { gettingStartedGuides } from 'src/features/VPCs/VPCLanding/VPCLandingEmptyStateData';
import { sendEvent } from 'src/utilities/analytics';

import { headers, linkAnalyticsEvent } from './VPCEmptyStateData';

export const VPCEmptyState = () => {
  const { push } = useHistory();

  return (
    <ResourcesSection
      buttonProps={[
        {
          children: 'Create VPC',
          onClick: () => {
            sendEvent({
              action: 'Click:button',
              category: linkAnalyticsEvent.category,
              label: 'Create VPC',
            });
            push('/vpcs/create');
          },
        },
      ]}
      gettingStartedGuidesData={gettingStartedGuides}
      headers={headers}
      icon={VPC}
      linkAnalyticsEvent={linkAnalyticsEvent}
    />
  );
};
