import * as React from 'react';

import CloudViewIcon from 'src/assets/icons/entityIcons/cloudview.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { sendEvent } from 'src/utilities/analytics';

import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
} from './NamespaceLandingEmptyResourcesData';

interface Props {
  openAddNamespaceDrawer: () => void;
}

export const NamespaceLandingEmptyState = (props: Props) => {
  const { openAddNamespaceDrawer } = props;

  return (
    <ResourcesSection
      buttonProps={[
        {
          children: 'Create Namespace',
          onClick: () => {
            sendEvent({
              action: 'Click:button',
              category: linkAnalyticsEvent.category,
              label: 'Create Namespace',
            });
            openAddNamespaceDrawer();
          },
        },
      ]}
      gettingStartedGuidesData={gettingStartedGuides}
      headers={headers}
      icon={CloudViewIcon}
      linkAnalyticsEvent={linkAnalyticsEvent}
    />
  );
};
