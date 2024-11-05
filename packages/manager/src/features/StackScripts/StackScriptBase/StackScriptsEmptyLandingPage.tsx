import * as React from 'react';
import { useHistory } from 'react-router-dom';

import LinodeIcon from 'src/assets/icons/entityIcons/linode.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { sendEvent } from 'src/utilities/analytics/utils';

import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from './StackScriptsEmptyResourcesData';

export const StackScriptsEmptyLandingState = () => {
  const history = useHistory();

  return (
    <ResourcesSection
      buttonProps={[
        {
          children: 'Create StackScript',
          onClick: () => {
            sendEvent({
              action: 'Click:button',
              category: linkAnalyticsEvent.category,
              label: 'Create StackScript',
            });
            history.push('/stackscripts/create');
          },
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
