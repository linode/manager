import * as React from 'react';
import { sendEvent } from 'src/utilities/ga';
import { StyledVolumeIcon } from './VolumesLandingEmptyState.styles';
import { useHistory } from 'react-router-dom';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import {
  gettingStartedGuides,
  headers,
  linkGAEvent,
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
              category: linkGAEvent.category,
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
      linkGAEvent={linkGAEvent}
      youtubeLinkData={youtubeLinkData}
    />
  );
};
