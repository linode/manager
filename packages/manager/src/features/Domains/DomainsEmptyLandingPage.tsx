import * as React from 'react';

import NetworkIcon from 'src/assets/icons/entityIcons/networking.svg';
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
  navigateToImportZone: () => void;
}

export const DomainsEmptyLandingState = (
  props: DomainsEmptyLandingStateProps
) => {
  const { navigateToCreate, navigateToImportZone } = props;

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
            navigateToImportZone();
          },
        },
      ]}
      gettingStartedGuidesData={gettingStartedGuides}
      headers={headers}
      icon={NetworkIcon}
      linkAnalyticsEvent={linkAnalyticsEvent}
      youtubeLinkData={youtubeLinkData}
    />
  );
};
