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
  youtubeLinkData,
} from './LoadBalancerEmptyStateData';

const AdditionalCopy = () => (
  <>
    <Typography> Don’t need a global load balancer?</Typography>
    <Typography sx={{ mb: '16px' }} variant="body1">
      {` `}
      <Link to="https://www.linode.com/products/nodebalancers/">
        NodeBalancer
      </Link>
      {` `}
      provides Layer 4 and HTTP/S Layer 7 (HTTP/1.1) local load balancing.
    </Typography>
    <Typography variant="body1">
      For a comparison of features available on Global Load Balancer and
      NodeBalancer, see
    </Typography>
    <Typography>
      <Link to="https://www.linode.com/docs/products/networking/global-loadbalancer/#selecting-a-load-balanceradbalancer#selecting-a-load-balancer#selecting-a-load-balancer ">
        Selecting a Load Balancer.
      </Link>
    </Typography>
  </>
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
      youtubeLinkData={youtubeLinkData}
    />
  );
};
