import * as React from 'react';
import ImageIcon from 'src/assets/icons/entityIcons/image.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { sendEvent } from 'src/utilities/analytics';
import { useHistory } from 'react-router-dom';
import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from './ImagesLandingEmptyStateData';

export const ImagesLandingEmptyState = () => {
  const { push } = useHistory();

  return (
    <ResourcesSection
      buttonProps={[
        {
          onClick: () => {
            sendEvent({
              category: linkAnalyticsEvent.category,
              action: 'Click:button',
              label: 'Create Image',
            });
            push('/images/create');
          },
          children: 'Create Image',
        },
      ]}
      gettingStartedGuidesData={gettingStartedGuides}
      headers={headers}
      icon={ImageIcon}
      linkAnalyticsEvent={linkAnalyticsEvent}
      youtubeLinkData={youtubeLinkData}
    />
  );
};
