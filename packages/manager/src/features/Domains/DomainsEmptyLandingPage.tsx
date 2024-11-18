import * as React from 'react';

import NodeBalancerIcon from 'src/assets/icons/entityIcons/nodebalancer.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { sendEvent } from 'src/utilities/analytics/utils';

import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from './DomainsEmptyResourcesData';

interface DomainsEmptyLandingStateProps {
  navigateToCreate: () => void;
  openImportZoneDrawer: () => void;
}

export const DomainsEmptyLandingState = (
  props: DomainsEmptyLandingStateProps
) => {
  const { navigateToCreate, openImportZoneDrawer } = props;

  return (
    <ResourcesSection
      buttonProps={[
        {
          children: 'Create Domain',
          onClick: () => {
            sendEvent({
              action: 'Click:button',
              category: linkAnalyticsEvent.category,
              label: 'Create Domain',
            });
            navigateToCreate();
          },
        },
        {
          children: 'Import a Zone',
          onClick: () => {
            sendEvent({
              action: 'Click:button',
              category: linkAnalyticsEvent.category,
              label: 'Import a Zone',
            });
            openImportZoneDrawer();
          },
        },
      ]}
      gettingStartedGuidesData={gettingStartedGuides}
      headers={headers}
      icon={NodeBalancerIcon}
      linkAnalyticsEvent={linkAnalyticsEvent}
      youtubeLinkData={youtubeLinkData}
    />
  );
};
