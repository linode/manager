import * as React from 'react';

import NetworkIcon from 'src/assets/icons/entityIcons/networking.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
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

  const { data: permissions } = usePermissions('account', ['create_firewall']);

  return (
    <ResourcesSection
      buttonProps={[
        {
          children: 'Create Firewall',
          disabled: !permissions.create_firewall,
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
      icon={NetworkIcon}
      linkAnalyticsEvent={linkAnalyticsEvent}
      youtubeLinkData={youtubeLinkData}
    />
  );
};
