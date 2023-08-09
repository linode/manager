import * as React from 'react';
import { useHistory } from 'react-router-dom';

import VPC from 'src/assets/icons/entityIcons/vpc.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import {
  gettingStartedGuides,
  youtubeLinkData,
} from 'src/features/Linodes/LinodesLanding/LinodesLandingEmptyStateData';
import {
  headers,
  linkAnalyticsEvent,
} from 'src/features/VPC/VPCLanding/VPCEmptyStateData';
import { sendEvent } from 'src/utilities/analytics';

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
            push('/vpc/create');
          },
        },
      ]}
      gettingStartedGuidesData={gettingStartedGuides}
      headers={headers}
      icon={VPC}
      linkAnalyticsEvent={linkAnalyticsEvent}
      youtubeLinkData={youtubeLinkData}
    />
  );
};
