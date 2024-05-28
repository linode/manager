import * as React from 'react';
import { useHistory } from 'react-router-dom';

import DatabaseIcon from 'src/assets/icons/entityIcons/database.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { sendEvent } from 'src/utilities/analytics/utils';

import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from './DatabaseLandingEmptyStateData';

export const DatabaseEmptyState = () => {
  const { push } = useHistory();

  return (
    <ResourcesSection
      buttonProps={[
        {
          children: 'Create Database Cluster',
          onClick: () => {
            sendEvent({
              action: 'Click:button',
              category: linkAnalyticsEvent.category,
              label: 'Create Database Cluster',
            });
            push('/databases/create');
          },
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
