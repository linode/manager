import * as React from 'react';
import { useHistory } from 'react-router-dom';

// TODO: AGLB - This is just a placeholder icon for now.
// will be updated with relevant icon once we get from UX
import NodeBalancer from 'src/assets/icons/entityIcons/nodebalancer.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { sendEvent } from 'src/utilities/analytics';

import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
} from './LoadBalancerEmptyStateData';

const AdditionalCopy = () => (
  <Typography sx={{ mb: '16px' }} variant="body1">
    Looking for a single data center Load Balancer? Try {` `}
    <Link to="https://www.linode.com/products/nodebalancers/">
      NodeBalancer.
    </Link>
  </Typography>
);

export const LoadBalancerLandingEmptyState = () => {
  const { push } = useHistory();

  return (
    <ResourcesSection
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
