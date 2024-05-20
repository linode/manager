import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { sendEvent } from 'src/utilities/analytics/utils';

import { StyledVolumeIcon } from './VolumesLandingEmptyState.styles';
import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from './VolumesLandingEmptyStateData';

export const VolumesLandingEmptyState = () => {
  const { push } = useHistory();

  return (
    <>
      <DocumentTitleSegment segment="Volumes" />
      <ResourcesSection
        buttonProps={[
          {
            children: 'Create Volume',
            onClick: () => {
              sendEvent({
                action: 'Click:button',
                category: linkAnalyticsEvent.category,
                label: 'Create Volume',
              });
              push('/volumes/create');
            },
          },
        ]}
        gettingStartedGuidesData={gettingStartedGuides}
        headers={headers}
        icon={StyledVolumeIcon}
        linkAnalyticsEvent={linkAnalyticsEvent}
        youtubeLinkData={youtubeLinkData}
      />
    </>
  );
};
