import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import NetworkingIcon from 'src/assets/icons/entityIcons/networking.svg';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
} from './NATGatewaysLandingEmptyStateData';

export const NATGatewaysLandingEmptyState = () => {
  const navigate = useNavigate();

  // TODO: it doesn't return natgateway scope today as the API doesn't have a way to make it available without immediately making it public,
  // so instead the team is using a different already existing scope for now (linodes). It will updated before LA.
  const { data: permissions } = usePermissions('account', ['create_linode']);

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="NAT Gateways" />
      <ResourcesSection
        buttonProps={[
          {
            children: 'Create NAT Gateway',
            // TODO: Update this to check for the correct scope once the API is updated to return it
            disabled: !permissions.create_linode,
            onClick: () => {
              navigate({ to: '/natgateways/create' });
            },
            tooltipText: getRestrictedResourceText({
              action: 'create',
              isSingular: false,
              resourceType: 'NAT Gateways',
            }),
          },
        ]}
        descriptionMaxWidth={500}
        gettingStartedGuidesData={gettingStartedGuides}
        headers={headers}
        icon={NetworkingIcon}
        linkAnalyticsEvent={linkAnalyticsEvent}
        wide={true}
      />
    </React.Fragment>
  );
};
