import * as React from 'react';

import FirewallIcon from 'src/assets/icons/entityIcons/firewall.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { sendEvent } from 'src/utilities/analytics/utils';

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
          children: 'Create Firewall',
          onClick: () => {
            sendEvent({
              action: 'Click:button',
              category: linkAnalyticsEvent.category,
              label: 'Create Firewall',
            });
            openAddFirewallDrawer();
          },
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
