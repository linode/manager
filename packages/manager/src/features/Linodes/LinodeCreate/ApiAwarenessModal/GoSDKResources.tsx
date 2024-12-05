import { Typography } from '@linode/ui';
import React from 'react';

import { ResourceLinks } from 'src/components/EmptyLandingPageResources/ResourcesLinks';

import type { ResourcesLinks } from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';

export const linkAnalyticsEvent: ResourcesLinks['linkAnalyticsEvent'] = {
  action: 'Click:link',
  category: 'Create Using Command Line Go SDK Installation and Documentation',
};

export const gettingStartedGuides: ResourcesLinks['links'] = [
  {
    text: `Go client for Linode REST v4 API`,
    to: 'https://github.com/linode/linodego',
  },
  {
    text: 'Linodego Documentation',
    to: 'https://pkg.go.dev/github.com/linode/linodego',
  },
];

export const GoSDKResources = () => {
  return (
    <>
      <Typography sx={(theme) => ({ mt: theme.spacing(2) })} variant="h3">
        Installation and Documentation
      </Typography>
      <ResourceLinks
        linkAnalyticsEvent={linkAnalyticsEvent}
        links={gettingStartedGuides}
      />
    </>
  );
};
