import * as React from 'react';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { sendEvent } from 'src/utilities/ga';
import { StyledBucketIcon } from './StylesBucketIcon';
import { useHistory } from 'react-router-dom';
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
      icon={StyledBucketIcon}
      linkGAEvent={linkGAEvent}
      showTransferDisplay
      youtubeLinkData={youtubeLinkData}
    />
  );
};
