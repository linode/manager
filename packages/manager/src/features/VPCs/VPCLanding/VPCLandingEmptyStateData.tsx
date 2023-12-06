import type {
  ResourcesHeaders,
  ResourcesLinkSection,
  ResourcesLinks,
} from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';

export const headers: ResourcesHeaders = {
  description:
    'Host your websites, applications, or any other Cloud-based workloads on a scalable and reliable platform.',
  subtitle: 'Cloud-based virtual machines',
  title: 'Linodes',
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
    {
      text: 'Overview of Virtual Private Clouds (VPCs)',
      to: 'https://www.linode.com/docs/products/networking/vpc/',
    },
    {
      text: 'Getting Started with VPCs',
      to: 'https://www.linode.com/docs/products/networking/vpc/get-started/',
    },
    {
      text: 'Create a VPC',
      to: 'https://www.linode.com/docs/products/networking/vpc/guides/create/',
    },
    {
      text: 'Manage VPC Subnets',
      to: 'https://www.linode.com/docs/products/networking/vpc/guides/subnets/',
    },
    {
      text: 'Assign (and Remove) Services',
      to:
        'https://www.linode.com/docs/products/networking/vpc/guides/assign-services/',
    },
  ],
  moreInfo: {
    text: 'View additional VPC guides',
    to: 'https://www.linode.com/docs/products/networking/vpc/guides/',
  },
  title: 'Getting Started Guides',
};

export const linkAnalyticsEvent: ResourcesLinks['linkAnalyticsEvent'] = {
  action: 'Click:link',
  category: 'VPCs landing page empty',
};
