import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
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

  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_volumes',
  });

  return (
    <>
      <DocumentTitleSegment segment="Volumes" />
      <ResourcesSection
        buttonProps={[
          {
            children: 'Create Volume',
            disabled: isRestricted,
            onClick: () => {
              sendEvent({
                action: 'Click:button',
                category: linkAnalyticsEvent.category,
                label: 'Create Volume',
              });
              push('/volumes/create');
            },
            tooltipText: getRestrictedResourceText({
              action: 'create',
              isSingular: false,
              resourceType: 'Volumes',
            }),
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
