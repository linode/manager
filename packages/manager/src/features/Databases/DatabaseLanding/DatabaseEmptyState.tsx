import * as React from 'react';
import { useHistory } from 'react-router-dom';

import DatabaseIcon from 'src/assets/icons/entityIcons/database.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from 'src/features/Databases/DatabaseLanding/DatabaseLandingEmptyStateData';
import { useIsDatabasesEnabled } from 'src/features/Databases/utilities';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { sendEvent } from 'src/utilities/analytics/utils';

export const DatabaseEmptyState = () => {
  const { push } = useHistory();
  const { isDatabasesV2Enabled, isV2GAUser } = useIsDatabasesEnabled();

  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_databases',
  });

  if (!isDatabasesV2Enabled || !isV2GAUser) {
    headers.logo = '';
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
            push('/databases/create');
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
