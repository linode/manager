import { useLDClient } from 'launchdarkly-react-client-sdk';
import React from 'react';

import { ResourceLinks } from 'src/components/EmptyLandingPageResources/ResourcesLinks';
import { Typography } from 'src/components/Typography';
import { LD_DX_TOOLS_METRICS_KEYS } from 'src/constants';
import { useFlags } from 'src/hooks/useFlags';
import { useIsAkamaiAccount } from 'src/hooks/useIsAkamaiAccount';

import type { ResourcesLinks } from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';

export const linkAnalyticsEvent: ResourcesLinks['linkAnalyticsEvent'] = {
  action: 'Click:link',
  category: 'Create Using Command Line Ansible Getting Started Resources',
};

export const gettingStartedGuides: ResourcesLinks['links'] = [
  {
    text: 'Getting Started With Ansible: Basic Installation and Setup',
    to: 'https://www.linode.com/docs/guides/getting-started-with-ansible/',
  },
  {
    text: 'Linode Cloud Instance Module',
    to:
      'https://github.com/linode/ansible_linode/blob/dev/docs/modules/instance.md',
  },
  {
    text: 'Manage Personal Access Tokens',
    to:
      'https://techdocs.akamai.com/cloud-computing/docs/manage-personal-access-tokens',
  },
  {
    text: 'Best Practices For Ansible',
    to: 'https://www.linode.com/docs/guides/front-line-best-practices-ansible/',
  },
  {
    text: 'Use the Linode Ansible Collection to Deploy a Linode',
    to:
      'https://www.linode.com/docs/guides/deploy-linodes-using-linode-ansible-collection/',
  },
];

export const AnsibleIntegrationResources = () => {
  const ldClient = useLDClient();
  const flags = useFlags();
  const { isAkamaiAccount: isInternalAccount } = useIsAkamaiAccount();

  const apicliButtonCopy = flags?.testdxtoolabexperiment;

  const handleClick = () => {
    if (!isInternalAccount) {
      ldClient?.track(
        LD_DX_TOOLS_METRICS_KEYS.INTEGRATION_ANSIBLE_RESOURCE_LINKS,
        {
          variation: apicliButtonCopy,
        }
      );
    }

    ldClient?.flush();
  };
  return (
    <>
      <Typography sx={(theme) => ({ mt: theme.spacing(2) })} variant="h3">
        Getting Started
      </Typography>
      <ResourceLinks
        linkAnalyticsEvent={linkAnalyticsEvent}
        links={gettingStartedGuides}
        onClick={handleClick}
      />
    </>
  );
};
