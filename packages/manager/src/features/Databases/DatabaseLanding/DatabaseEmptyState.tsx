import * as React from 'react';
import { useHistory } from 'react-router-dom';
import DatabaseIcon from 'src/assets/icons/entityIcons/database.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import ProductInformationBanner from 'src/components/ProductInformationBanner';
import { sendEvent } from 'src/utilities/ga';
import {
  gettingStartedGuides,
  headers,
  linkGAEvent,
  youtubeLinkData,
} from './DatabaseLandingEmptyStateData';

export const DatabaseEmptyState = () => {
  const { push } = useHistory();

  return (
    <>
      <ProductInformationBanner bannerLocation="Databases" warning important />

      <ResourcesSection
        buttonProps={[
          {
            onClick: () => {
              sendEvent({
                category: linkGAEvent.category,
                action: 'Click:button',
                label: 'Create Database Cluster',
              });
              push('/databases/create');
            },
            children: 'Create Database Cluster',
          },
        ]}
        gettingStartedGuidesData={gettingStartedGuides}
        headers={headers}
        icon={DatabaseIcon}
        linkGAEvent={linkGAEvent}
        youtubeLinkData={youtubeLinkData}
      />
    </>
  );
};
