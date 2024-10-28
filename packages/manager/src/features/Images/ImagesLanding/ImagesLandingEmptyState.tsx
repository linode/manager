import * as React from 'react';
import { useHistory } from 'react-router-dom';

import LinodeIcon from 'src/assets/icons/entityIcons/linode.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { sendEvent } from 'src/utilities/analytics/utils';

import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from './ImagesLandingEmptyStateData';

export const ImagesLandingEmptyState = () => {
  const { push } = useHistory();

  const isImagesReadOnly = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_images',
  });

  return (
    <ResourcesSection
      buttonProps={[
        {
          children: 'Create Image',
          disabled: isImagesReadOnly,
          onClick: () => {
            sendEvent({
              action: 'Click:button',
              category: linkAnalyticsEvent.category,
              label: 'Create Image',
            });
            push('/images/create');
          },
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'Images',
          }),
        },
      ]}
      gettingStartedGuidesData={gettingStartedGuides}
      headers={headers}
      icon={LinodeIcon}
      linkAnalyticsEvent={linkAnalyticsEvent}
      youtubeLinkData={youtubeLinkData}
    />
  );
};
