import * as React from 'react';
import AppsSection from './AppsSection';
import LinodeSvg from 'src/assets/icons/entityIcons/linode.svg';
import MarketplaceIcon from 'src/assets/icons/marketplace.svg';
import PointerIcon from 'src/assets/icons/pointer.svg';
import { getLinkOnClick } from 'src/utilities/emptyStateLandingUtils';
import { ResourcesLinkIcon } from 'src/components/EmptyLandingPageResources/ResourcesLinkIcon';
import { ResourcesLinksSubSection } from 'src/components/EmptyLandingPageResources/ResourcesLinksSubSection';
import { ResourcesMoreLink } from 'src/components/EmptyLandingPageResources/ResourcesMoreLink';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { sendEvent } from 'src/utilities/ga';
import { useHistory } from 'react-router-dom';
import {
  gettingStartedGuides,
  headers,
  linkGAEvent,
  youtubeLinkData,
} from './LinodesLandingEmptyStateData';

const APPS_MORE_LINKS_TEXT = 'See all Marketplace apps';

export const LinodesLandingEmptyState = () => {
  const { push } = useHistory();

  return (
    <ResourcesSection
      buttonProps={[
        {
          onClick: () => {
            push('/linodes/create');
            sendEvent({
              category: linkGAEvent.category,
              action: 'Click:button',
              label: 'Create Linode',
            });
          },
          children: 'Create Linode',
        },
      ]}
      CustomResource={() => (
        <ResourcesLinksSubSection
          title="Deploy an App"
          icon={<MarketplaceIcon />}
          MoreLink={(props) => (
            <ResourcesMoreLink
              onClick={getLinkOnClick(linkGAEvent, APPS_MORE_LINKS_TEXT)}
              to="/linodes/create?type=One-Click"
              {...props}
            >
              {APPS_MORE_LINKS_TEXT}
              <ResourcesLinkIcon icon={<PointerIcon />} iconType="pointer" />
            </ResourcesMoreLink>
          )}
        >
          <AppsSection />
        </ResourcesLinksSubSection>
      )}
      descriptionMaxWidth={500}
      gettingStartedGuidesData={gettingStartedGuides}
      headers={headers}
      icon={LinodeSvg}
      linkGAEvent={linkGAEvent}
      showTransferDisplay={true}
      youtubeLinkData={youtubeLinkData}
      wide={true}
    />
  );
};
