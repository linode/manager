import * as React from 'react';
import FirewallIcon from 'src/assets/icons/entityIcons/firewall.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { useHistory } from 'react-router-dom';
import { sendEvent } from 'src/utilities/ga';
import {
  gettingStartedGuides,
  headers,
  linkGAEvent,
  youtubeLinkData,
} from './BucketLandingEmptyResourcesData';

export const BucketLandingEmptyState = () => {
  const history = useHistory();

  return (
    <ResourcesSection
      buttonProps={[
        {
          onClick: () => {
            sendEvent({
              category: linkGAEvent.category,
              action: 'Click:button',
              label: 'Create Bucket',
            });
            history.replace('/object-storage/buckets/create');
          },

          children: 'Create Bucket',
        },
      ]}
      gettingStartedGuidesData={gettingStartedGuides}
      headers={headers}
      icon={FirewallIcon}
      linkGAEvent={linkGAEvent}
      youtubeLinkData={youtubeLinkData}
      showTransferDisplay
    />
  );
};
