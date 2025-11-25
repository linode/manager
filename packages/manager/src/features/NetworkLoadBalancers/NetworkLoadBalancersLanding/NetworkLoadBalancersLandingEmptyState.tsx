import { Typography } from '@linode/ui';
import * as React from 'react';

import DocsIcon from 'src/assets/icons/docs.svg';
import NetworkIcon from 'src/assets/icons/entityIcons/networking.svg';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Placeholder } from 'src/components/Placeholder/Placeholder';

import { NLB_API_DOCS_LINK } from '../constants';

export const NetworkLoadBalancersLandingEmptyState = () => {
  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Network Load Balancer" />
      <Placeholder
        buttonProps={[
          {
            buttonType: 'outlined',
            startIcon: <DocsIcon />,
            children: 'Learn More',
            href: NLB_API_DOCS_LINK,
            target: '_blank',
            sx: {
              textDecoration: 'none',
              '&:hover, &:focus, &:focus-visible': {
                textDecoration: 'none',
              },
            },
            rel: 'noopener noreferrer',
          },
        ]}
        icon={NetworkIcon}
        isEntity
        subtitle="High Capacity load balancing service"
        title="Network Load Balancer"
      >
        <Typography variant="h3">
          Deliver real-time, high-volume traffic management for your most
          demanding workloads.
        </Typography>
      </Placeholder>
    </React.Fragment>
  );
};
