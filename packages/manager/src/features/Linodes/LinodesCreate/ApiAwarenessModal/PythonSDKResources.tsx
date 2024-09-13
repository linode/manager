import { useLDClient } from 'launchdarkly-react-client-sdk';
import React from 'react';

import { ResourceLinks } from 'src/components/EmptyLandingPageResources/ResourcesLinks';
import { Typography } from 'src/components/Typography';
import { LD_DX_TOOLS_METRICS_KEYS } from 'src/constants';
import { useFlags } from 'src/hooks/useFlags';

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
  const ldClient = useLDClient();
  const flags = useFlags();

  const apicliButtonCopy = flags?.testdxtoolabexperiment;

  const handleClick = () => {
    ldClient?.track(LD_DX_TOOLS_METRICS_KEYS.SDK_PYTHON_RESOURCE_LINKS, {
      variation: apicliButtonCopy,
    });
    ldClient?.flush();
  };
  return (
    <>
      <Typography sx={(theme) => ({ mt: theme.spacing(2) })} variant="h3">
        Installation and Usage
      </Typography>
      <ResourceLinks
        linkAnalyticsEvent={linkAnalyticsEvent}
        links={gettingStartedGuides}
        onClick={handleClick}
      />
    </>
  );
};
