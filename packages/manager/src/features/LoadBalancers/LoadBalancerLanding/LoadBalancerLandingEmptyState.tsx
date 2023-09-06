import * as React from 'react';
import { useHistory } from 'react-router-dom';

// TODO: AGLB - This is just a placeholder icon for now.
import DocsIcon from 'src/assets/icons/docs.svg';
// will be updated with relevant icon once we get from UX
import NodeBalancer from 'src/assets/icons/entityIcons/nodebalancer.svg';
import { ResourceLinks } from 'src/components/EmptyLandingPageResources/ResourcesLinks';
import { ResourcesLinksSubSection } from 'src/components/EmptyLandingPageResources/ResourcesLinksSubSection';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { sendEvent } from 'src/utilities/analytics';

import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  resourcesLinks,
} from './LoadBalancerEmptyStateData';

import type {
  ResourcesLinkSection,
  linkAnalyticsEvent as linkAnalyticsEventType,
} from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';

const AdditionalCopy = () => (
  <Typography sx={{ mb: '16px' }} variant="body1">
    Looking for a single data center Load Balancer? Try {` `}
    <Link to="https://www.linode.com/products/nodebalancers/">
      NodeBalancer.
    </Link>
  </Typography>
);

const GetResourceLinks = (
  guides: ResourcesLinkSection,
  linkAnalyticsEvent: linkAnalyticsEventType
) => (
  <ResourceLinks linkAnalyticsEvent={linkAnalyticsEvent} links={guides.links} />
);

export const LoadBalancerLandingEmptyState = () => {
  const { push } = useHistory();

  return (
    <ResourcesSection
      CustomResource={() => (
        <ResourcesLinksSubSection
          icon={<DocsIcon />}
          title={resourcesLinks.title}
        >
          {GetResourceLinks(resourcesLinks, linkAnalyticsEvent)}
        </ResourcesLinksSubSection>
      )}
      buttonProps={[
        {
          children: 'Create Global Load Balancer',
          onClick: () => {
            sendEvent({
              action: 'Click:button',
              category: linkAnalyticsEvent.category,
              label: 'Global Load Balancers',
            });
            push('/loadbalancers/create');
          },
        },
      ]}
      additionalCopy={<AdditionalCopy />}
      gettingStartedGuidesData={gettingStartedGuides}
      headers={headers}
      icon={NodeBalancer}
      linkAnalyticsEvent={linkAnalyticsEvent}
    />
  );
};
