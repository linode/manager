import { useLDClient } from 'launchdarkly-react-client-sdk';
import React from 'react';

import { ResourceLinks } from 'src/components/EmptyLandingPageResources/ResourcesLinks';
import { Typography } from 'src/components/Typography';
import { LD_DX_TOOLS_METRICS_KEYS } from 'src/constants';
import { useFlags } from 'src/hooks/useFlags';

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
  const ldClient = useLDClient();
  const flags = useFlags();

  const apicliButtonCopy = flags?.testdxtoolabexperiment;

  const handleClick = () => {
    ldClient?.track(LD_DX_TOOLS_METRICS_KEYS.SDK_GO_RESOURCE_LINKS, {
      variation: apicliButtonCopy,
    });
  };
  return (
    <>
      <Typography sx={(theme) => ({ mt: theme.spacing(2) })} variant="h3">
        Installation and Documentation
      </Typography>
      <ResourceLinks
        linkAnalyticsEvent={linkAnalyticsEvent}
        links={gettingStartedGuides}
        onClick={handleClick}
      />
    </>
  );
};
