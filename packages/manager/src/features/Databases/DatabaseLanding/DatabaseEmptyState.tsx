import { sendEvent } from '@akamai/compute-ui-core/analytics';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import DatabaseIcon from 'src/assets/icons/entityIcons/database.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from 'src/features/Databases/DatabaseLanding/DatabaseLandingEmptyStateData';
import DatabaseLogo from 'src/features/Databases/DatabaseLanding/DatabaseLogo';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

export const DatabaseEmptyState = () => {
  const navigate = useNavigate();

  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_databases',
  });

  headers.logo = <DatabaseLogo />;

  return (
    <ResourcesSection
      buttonProps={[
        {
          children: 'Create Database Cluster',
          disabled: isRestricted,
          onClick: () => {
            sendEvent({
              action: 'Click:button',
              category: linkAnalyticsEvent.category,
              label: 'Create Database Cluster',
            });
            navigate({
              to: '/databases/create',
            });
          },
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'Databases',
          }),
        },
      ]}
      gettingStartedGuidesData={gettingStartedGuides}
      headers={headers}
      icon={DatabaseIcon}
      linkAnalyticsEvent={linkAnalyticsEvent}
      youtubeLinkData={youtubeLinkData}
    />
  );
};
