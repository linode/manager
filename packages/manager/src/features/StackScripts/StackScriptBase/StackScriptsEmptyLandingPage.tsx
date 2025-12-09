import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import ComputeIcon from 'src/assets/icons/entityIcons/compute.svg';
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
  const navigate = useNavigate();

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
            navigate({ to: '/stackscripts/create' });
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
      icon={ComputeIcon}
      linkAnalyticsEvent={linkAnalyticsEvent}
      youtubeLinkData={youtubeLinkData}
    />
  );
};
