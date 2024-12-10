import { Typography } from '@linode/ui';
import React from 'react';

import { ResourceLinks } from 'src/components/EmptyLandingPageResources/ResourcesLinks';

import type { ResourcesLinks } from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';

export const linkAnalyticsEvent: ResourcesLinks['linkAnalyticsEvent'] = {
  action: 'Click:link',
  category: 'Create Using Command Line Terraform Getting Started Resources',
};

export const gettingStartedGuides: ResourcesLinks['links'] = [
  {
    text: `A Beginner's Guide to Terraform`,
    to: 'https://www.linode.com/docs/guides/beginners-guide-to-terraform/',
  },
  {
    text: 'Install Terraform',
    to:
      'https://www.linode.com/docs/guides/how-to-build-your-infrastructure-using-terraform-and-linode/#install-terraform',
  },
  {
    text: 'Manage Personal Access Tokens',
    to:
      'https://techdocs.akamai.com/cloud-computing/docs/manage-personal-access-tokens',
  },
  {
    text: 'Use Terraform With Linode Object Storage',
    to:
      'https://www.linode.com/docs/guides/how-to-use-terraform-with-linode-object-storage/',
  },
  {
    text: 'Use Terraform to Provision Infrastructure on Linode',
    to:
      'https://www.linode.com/docs/guides/how-to-build-your-infrastructure-using-terraform-and-linode/',
  },
  {
    text: 'Import Existing Infrastructure to Terraform',
    to:
      'https://www.linode.com/docs/guides/import-existing-infrastructure-to-terraform/',
  },
];

export const TerraformIntegrationResources = () => {
  return (
    <>
      <Typography sx={(theme) => ({ mt: theme.spacing(2) })} variant="h3">
        Getting Started
      </Typography>
      <ResourceLinks
        linkAnalyticsEvent={linkAnalyticsEvent}
        links={gettingStartedGuides}
      />
    </>
  );
};
