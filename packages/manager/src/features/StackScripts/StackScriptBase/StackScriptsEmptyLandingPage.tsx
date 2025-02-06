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
} from './StackScriptsEmptyResourcesData';

export const StackScriptsEmptyLandingState = () => {
  const history = useHistory();

  const isStackScriptCreationRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_stackscripts',
  });

  return (
    <ResourcesSection
      buttonProps={[
        {
          children: 'Create StackScript',
          disabled: isStackScriptCreationRestricted,
          onClick: () => {
            sendEvent({
              action: 'Click:button',
              category: linkAnalyticsEvent.category,
              label: 'Create StackScript',
            });
            history.push('/stackscripts/create');
          },
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'StackScripts',
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
