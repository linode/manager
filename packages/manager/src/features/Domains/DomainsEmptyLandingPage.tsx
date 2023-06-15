import * as React from 'react';
import DomainIcon from 'src/assets/icons/entityIcons/domain.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { sendEvent } from 'src/utilities/analytics';
import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from './DomainsEmptyResourcesData';

interface Props {
  navigateToCreate: () => void;
  openImportZoneDrawer: () => void;
}

export const DomainsEmptyLandingState = (props: Props) => {
  const { navigateToCreate, openImportZoneDrawer } = props;

  return (
    <ResourcesSection
      buttonProps={[
        {
          onClick: () => {
            sendEvent({
              category: linkAnalyticsEvent.category,
              action: 'Click:button',
              label: 'Create Domain',
            });
            navigateToCreate();
          },
          children: 'Create Domain',
        },
        {
          onClick: () => {
            sendEvent({
              category: linkAnalyticsEvent.category,
              action: 'Click:button',
              label: 'Import a Zone',
            });
            openImportZoneDrawer();
          },
          children: 'Import a Zone',
        },
      ]}
      gettingStartedGuidesData={gettingStartedGuides}
      headers={headers}
      icon={DomainIcon}
      linkAnalyticsEvent={linkAnalyticsEvent}
      youtubeLinkData={youtubeLinkData}
    />
  );
};
