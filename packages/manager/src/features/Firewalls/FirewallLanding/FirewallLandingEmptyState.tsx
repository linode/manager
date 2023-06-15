import * as React from 'react';
import FirewallIcon from 'src/assets/icons/entityIcons/firewall.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { sendEvent } from 'src/utilities/analytics';
import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from './FirewallLandingEmptyResourcesData';

interface Props {
  openAddFirewallDrawer: () => void;
}

export const FirewallLandingEmptyState = (props: Props) => {
  const { openAddFirewallDrawer } = props;

  return (
    <ResourcesSection
      buttonProps={[
        {
          onClick: () => {
            sendEvent({
              category: linkAnalyticsEvent.category,
              action: 'Click:button',
              label: 'Create Firewall',
            });
            openAddFirewallDrawer();
          },
          children: 'Create Firewall',
        },
      ]}
      gettingStartedGuidesData={gettingStartedGuides}
      headers={headers}
      icon={FirewallIcon}
      linkAnalyticsEvent={linkAnalyticsEvent}
      youtubeLinkData={youtubeLinkData}
    />
  );
};
