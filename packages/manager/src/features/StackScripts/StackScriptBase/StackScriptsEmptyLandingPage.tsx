import * as React from 'react';
import StackScriptsIcon from 'src/assets/icons/entityIcons/stackscript.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { sendEvent } from 'src/utilities/analytics';
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
          onClick: () => {
            sendEvent({
              category: linkAnalyticsEvent.category,
              action: 'Click:button',
              label: 'Create StackScript',
            });
            goToCreateStackScript();
          },
          children: 'Create StackScript',
        },
      ]}
      gettingStartedGuidesData={gettingStartedGuides}
      headers={headers}
      icon={StackScriptsIcon}
      linkAnalyticsEvent={linkAnalyticsEvent}
      youtubeLinkData={youtubeLinkData}
    />
  );
};
