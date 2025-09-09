import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import NetworkIcon from 'src/assets/icons/entityIcons/networking.svg';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { sendEvent } from 'src/utilities/analytics/utils';

import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from './NodeBalancersLandingEmptyStateData';

export const NodeBalancerLandingEmptyState = () => {
  const navigate = useNavigate();

  const { data: permissions } = usePermissions('account', [
    'create_nodebalancer',
  ]);

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="NodeBalancers" />
      <ResourcesSection
        buttonProps={[
          {
            children: 'Create NodeBalancer',
            disabled: !permissions.create_nodebalancer,
            onClick: () => {
              sendEvent({
                action: 'Click:button',
                category: linkAnalyticsEvent.category,
                label: 'Create NodeBalancer',
              });
              navigate({
                to: '/nodebalancers/create',
              });
            },
            tooltipText: getRestrictedResourceText({
              action: 'create',
              isSingular: false,
              resourceType: 'NodeBalancers',
            }),
          },
        ]}
        gettingStartedGuidesData={gettingStartedGuides}
        headers={headers}
        icon={NetworkIcon}
        linkAnalyticsEvent={linkAnalyticsEvent}
        youtubeLinkData={youtubeLinkData}
      />
    </React.Fragment>
  );
};
