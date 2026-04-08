import * as React from 'react';

import NetworkingIcon from 'src/assets/icons/entityIcons/networking.svg';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';

import { ReserveIPDrawer } from '../ReserveIPDrawer';
import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
} from './ReservedIpsLandingEmptyStateData';

export const ReservedIpsLandingEmptyState = () => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Reserved IP Addresses" />
      <ResourcesSection
        buttonProps={[
          {
            children: 'Reserve an IP Address',
            onClick: () => setIsDrawerOpen(true),
          },
        ]}
        descriptionMaxWidth={500}
        gettingStartedGuidesData={gettingStartedGuides}
        headers={headers}
        icon={NetworkingIcon}
        linkAnalyticsEvent={linkAnalyticsEvent}
        wide={true}
      />
      <ReserveIPDrawer
        mode="create"
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
      />
    </React.Fragment>
  );
};
