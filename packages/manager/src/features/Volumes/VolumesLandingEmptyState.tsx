import * as React from 'react';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { sendEvent } from 'src/utilities/analytics';
import { StyledVolumeIcon } from './VolumesLandingEmptyState.styles';
import { useHistory } from 'react-router-dom';
import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from './VolumesLandingEmptyStateData';

export const VolumesLandingEmptyState = () => {
  const { push } = useHistory();

  return (
    <ResourcesSection
      buttonProps={[
        {
          onClick: () => {
            sendEvent({
              category: linkAnalyticsEvent.category,
              action: 'Click:button',
              label: 'Create Volume',
            });
            push('/volumes/create');
          },
          children: 'Create Volume',
        },
      ]}
      gettingStartedGuidesData={gettingStartedGuides}
      headers={headers}
      icon={StyledVolumeIcon}
      linkAnalyticsEvent={linkAnalyticsEvent}
      youtubeLinkData={youtubeLinkData}
    />
  );
};
