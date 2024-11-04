import * as React from 'react';

import LinodeIcon from 'src/assets/icons/entityIcons/linode.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { sendEvent } from 'src/utilities/analytics/utils';

import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from './StackScriptsEmptyResourcesData';

interface Props {
  goToCreateStackScript: () => void;
}

export const StackScriptsEmptyLandingState = (props: Props) => {
  const { goToCreateStackScript } = props;

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
            goToCreateStackScript();
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
