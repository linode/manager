import * as React from 'react';

import FirewallIcon from 'src/assets/icons/entityIcons/firewall.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { getRestrictedResourceText } from 'src/features/Account/utils';
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

  const isFirewallsCreationRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_firewalls',
  });

  return (
    <ResourcesSection
      buttonProps={[
        {
          children: 'Create Firewall',
          disabled: isFirewallsCreationRestricted,
          onClick: () => {
            sendEvent({
              action: 'Click:button',
              category: linkAnalyticsEvent.category,
              label: 'Create Firewall',
            });
            openAddFirewallDrawer();
          },
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'Firewalls',
          }),
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
