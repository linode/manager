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
      to: 'https://techdocs.akamai.com/cloud-computing/docs/vpc',
    },
    {
      text: 'Getting Started with VPCs',
      to:
        'https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-vpc',
    },
    {
      text: 'Create a VPC',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/create-a-vpc',
    },
    {
      text: 'Manage VPC Subnets',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/manage-vpc-subnets',
    },
    {
      text: 'Assign (and Remove) Services',
      to:
        'https://techdocs.akamai.com/cloud-computing/docs/assign-a-compute-instance-to-a-vpc',
    },
  ],
  moreInfo: {
    text: 'View additional VPC guides',
    to: 'https://techdocs.akamai.com/cloud-computing/docs/vpc',
  },
  title: 'Getting Started Guides',
};

export const linkAnalyticsEvent: ResourcesLinks['linkAnalyticsEvent'] = {
  action: 'Click:link',
  category: 'VPCs landing page empty',
};
