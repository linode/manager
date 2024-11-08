import * as React from 'react';
import { useHistory } from 'react-router-dom';

import NodeBalancerIcon from 'src/assets/icons/entityIcons/nodebalancer.svg';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { sendEvent } from 'src/utilities/analytics/utils';

import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from './NodeBalancersLandingEmptyStateData';

export const NodeBalancerLandingEmptyState = () => {
  const { push } = useHistory();

  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_nodebalancers',
  });

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="NodeBalancers" />
      <ResourcesSection
        buttonProps={[
          {
            children: 'Create NodeBalancer',
            disabled: isRestricted,
            onClick: () => {
              sendEvent({
                action: 'Click:button',
                category: linkAnalyticsEvent.category,
                label: 'Create NodeBalancer',
              });
              push('/nodebalancers/create');
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
        icon={NodeBalancerIcon}
        linkAnalyticsEvent={linkAnalyticsEvent}
        youtubeLinkData={youtubeLinkData}
      />
    </React.Fragment>
  );
};
