import * as React from 'react';
import { useHistory } from 'react-router-dom';

import LinodeSvg from 'src/assets/icons/entityIcons/linode.svg';
import MarketplaceIcon from 'src/assets/icons/marketplace.svg';
import PointerIcon from 'src/assets/icons/pointer.svg';
import { ResourcesLinksSubSection } from 'src/components/EmptyLandingPageResources/ResourcesLinksSubSection';
import { ResourcesMoreLink } from 'src/components/EmptyLandingPageResources/ResourcesMoreLink';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { sendEvent } from 'src/utilities/analytics';
import { getLinkOnClick } from 'src/utilities/emptyStateLandingUtils';

import { AppsSection } from './AppsSection';
import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from './LinodesLandingEmptyStateData';

const APPS_MORE_LINKS_TEXT = 'See all Marketplace apps';

export const LinodesLandingEmptyState = () => {
  const { push } = useHistory();

  return (
    <ResourcesSection
      CustomResource={() => (
        <ResourcesLinksSubSection
          MoreLink={(props) => (
            <ResourcesMoreLink
              onClick={getLinkOnClick(linkAnalyticsEvent, APPS_MORE_LINKS_TEXT)}
              to="/linodes/create?type=One-Click"
              {...props}
            >
              {APPS_MORE_LINKS_TEXT}
              <span style={{ left: 2, position: 'relative', top: 4 }}>
                <PointerIcon />
              </span>
            </ResourcesMoreLink>
          )}
          icon={<MarketplaceIcon />}
          title="Deploy an App"
        >
          <AppsSection />
        </ResourcesLinksSubSection>
      )}
      buttonProps={[
        {
          children: 'Create Linode',
          onClick: () => {
            push('/linodes/create');
            sendEvent({
              action: 'Click:button',
              category: linkAnalyticsEvent.category,
              label: 'Create Linode',
            });
          },
        },
      ]}
      descriptionMaxWidth={500}
      gettingStartedGuidesData={gettingStartedGuides}
      headers={headers}
      icon={LinodeSvg}
      linkAnalyticsEvent={linkAnalyticsEvent}
      showTransferDisplay={true}
      wide={true}
      youtubeLinkData={youtubeLinkData}
    />
  );
};
