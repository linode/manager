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
import { useIsDatabasesEnabled } from 'src/features/Databases/utilities';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { sendEvent } from 'src/utilities/analytics/utils';

export const DatabaseEmptyState = () => {
  const navigate = useNavigate();
  const { isDatabasesV2Enabled, isDatabasesV2GA } = useIsDatabasesEnabled();

  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_databases',
  });

  if (isDatabasesV2Enabled || isDatabasesV2GA) {
    headers.logo = (
      <DatabaseLogo sx={{ marginBottom: '20px', marginTop: '-10px' }} />
    );
  }

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
