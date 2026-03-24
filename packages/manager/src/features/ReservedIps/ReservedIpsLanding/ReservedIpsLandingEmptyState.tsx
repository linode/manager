import * as React from 'react';

import NetworkingIcon from 'src/assets/icons/entityIcons/networking.svg';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';

import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from './ReservedIpsLandingEmptyStateData';

export const ReservedIpsLandingEmptyState = () => {
  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Reserved IP Addresses" />
      <ResourcesSection
        buttonProps={[
          {
            children: 'Reserve an IP Address',
            onClick: () => {
              // TODO: Open Reserve IP create drawer once ready
            },
          },
        ]}
        descriptionMaxWidth={500}
        gettingStartedGuidesData={gettingStartedGuides}
        headers={headers}
        icon={NetworkingIcon}
        linkAnalyticsEvent={linkAnalyticsEvent}
        wide={true}
        youtubeLinkData={youtubeLinkData}
      />
    </React.Fragment>
  );
};
