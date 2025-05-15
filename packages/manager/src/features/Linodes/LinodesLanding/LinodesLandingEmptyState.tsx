import * as React from 'react';
import { useHistory } from 'react-router-dom';

import ComputeIcon from 'src/assets/icons/entityIcons/compute.svg';
import MarketplaceIcon from 'src/assets/icons/marketplace.svg';
import PointerIcon from 'src/assets/icons/pointer.svg';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ResourcesLinksSubSection } from 'src/components/EmptyLandingPageResources/ResourcesLinksSubSection';
import { ResourcesMoreLink } from 'src/components/EmptyLandingPageResources/ResourcesMoreLink';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { sendEvent } from 'src/utilities/analytics/utils';
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

  const isLinodesGrantReadOnly = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Linodes" />
      <ResourcesSection
        buttonProps={[
          {
            children: 'Create Linode',
            disabled: isLinodesGrantReadOnly,
            onClick: () => {
              push('/linodes/create');
              sendEvent({
                action: 'Click:button',
                category: linkAnalyticsEvent.category,
                label: 'Create Linode',
              });
            },
            tooltipText: getRestrictedResourceText({
              action: 'create',
              isSingular: false,
              resourceType: 'Linodes',
            }),
          },
        ]}
        CustomResource={() => (
          <ResourcesLinksSubSection
            icon={<MarketplaceIcon />}
            MoreLink={(props) => (
              <ResourcesMoreLink
                onClick={getLinkOnClick(
                  linkAnalyticsEvent,
                  APPS_MORE_LINKS_TEXT
                )}
                to="/linodes/create?type=One-Click"
                {...props}
              >
                {APPS_MORE_LINKS_TEXT}
                <span style={{ left: 2, position: 'relative', top: 4 }}>
                  <PointerIcon />
                </span>
              </ResourcesMoreLink>
            )}
            title="Deploy an App"
          >
            <AppsSection />
          </ResourcesLinksSubSection>
        )}
        descriptionMaxWidth={500}
        gettingStartedGuidesData={gettingStartedGuides}
        headers={headers}
        icon={ComputeIcon}
        linkAnalyticsEvent={linkAnalyticsEvent}
        showTransferDisplay={true}
        wide={true}
        youtubeLinkData={youtubeLinkData}
      />
    </React.Fragment>
  );
};
