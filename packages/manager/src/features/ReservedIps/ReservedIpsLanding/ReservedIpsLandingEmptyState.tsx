import * as React from 'react';

import NetworkingIcon from 'src/assets/icons/entityIcons/networking.svg';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';

import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
} from './ReservedIpsLandingEmptyStateData';

interface Props {
  openReserveIPDrawer: () => void;
}

export const ReservedIpsLandingEmptyState = ({
  openReserveIPDrawer,
}: Props) => {
  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Reserved IP Addresses" />
      <ResourcesSection
        buttonProps={[
          {
            children: 'Reserve an IP Address',
            onClick: openReserveIPDrawer,
          },
        ]}
        descriptionMaxWidth={500}
        gettingStartedGuidesData={gettingStartedGuides}
        headers={headers}
        icon={NetworkingIcon}
        linkAnalyticsEvent={linkAnalyticsEvent}
        wide={true}
      />
    </React.Fragment>
  );
};
