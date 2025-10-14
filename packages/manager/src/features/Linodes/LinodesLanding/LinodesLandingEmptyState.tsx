import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import ComputeIcon from 'src/assets/icons/entityIcons/compute.svg';
import MarketplaceIcon from 'src/assets/icons/marketplace.svg';
import PointerIcon from 'src/assets/icons/pointer.svg';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ResourcesLinksSubSection } from 'src/components/EmptyLandingPageResources/ResourcesLinksSubSection';
import { ResourcesMoreLink } from 'src/components/EmptyLandingPageResources/ResourcesMoreLink';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
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
  const navigate = useNavigate();

  const { data: permissions } = usePermissions('account', ['create_linode']);

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Linodes" />
      <ResourcesSection
        buttonProps={[
          {
            children: 'Create Linode',
            disabled: !permissions.create_linode,
            onClick: () => {
              navigate({ to: '/linodes/create' });
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
                to="/linodes/create/marketplace"
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
