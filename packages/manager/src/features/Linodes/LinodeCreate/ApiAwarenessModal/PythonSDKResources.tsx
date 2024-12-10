import { Typography } from '@linode/ui';
import React from 'react';

import { ResourceLinks } from 'src/components/EmptyLandingPageResources/ResourcesLinks';

import type { ResourcesLinks } from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';

export const linkAnalyticsEvent: ResourcesLinks['linkAnalyticsEvent'] = {
  action: 'Click:link',
  category: 'Create Using Command Line Python SDK Installation and Usage',
};

export const gettingStartedGuides: ResourcesLinks['links'] = [
  {
    text: 'Official python library for the Linode APIv4 in python',
    to: 'https://github.com/linode/linode_api4-python',
  },
  {
    text: 'linode_api4-python Documentation',
    to: 'https://linode-api4.readthedocs.io/en/latest/?badge=latest',
  },
];

export const PythonSDKResources = () => {
  return (
    <>
      <Typography sx={(theme) => ({ mt: theme.spacing(2) })} variant="h3">
        Installation and Usage
      </Typography>
      <ResourceLinks
        linkAnalyticsEvent={linkAnalyticsEvent}
        links={gettingStartedGuides}
      />
    </>
  );
};
