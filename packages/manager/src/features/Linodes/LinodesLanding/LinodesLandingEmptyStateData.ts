import {
  docsLink,
  guidesMoreLinkText,
  youtubeChannelLink,
  youtubeMoreLinkText,
} from 'src/utilities/emptyStateLandingUtils';

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
      text: 'Create a Compute Instance',
      to:
        'https://techdocs.akamai.com/cloud-computing/docs/create-a-compute-instance',
    },
    {
      text: 'Getting Started with Linode Compute Instances',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/getting-started',
    },
    {
      text: 'Understanding Billing and Payment',
      to:
        'https://techdocs.akamai.com/cloud-computing/docs/understanding-how-billing-works',
    },
    {
      text: 'Hosting a Website or Application on Linode',
      to: 'https://www.linode.com/docs/guides/set-up-web-server-host-website/',
    },
  ],
  moreInfo: {
    text: guidesMoreLinkText,
    to: docsLink,
  },
  title: 'Getting Started Guides',
};

export const youtubeLinkData: ResourcesLinkSection = {
  links: [
    {
      external: true,
      text: 'Linode Getting Started Guide',
      to: 'https://www.youtube.com/watch?v=KEK-ZxrGxMA',
    },
    {
      external: true,
      text: 'Common Linux Commands',
      to: 'https://www.youtube.com/watch?v=AVXYq8aL47Q',
    },
    {
      external: true,
      text: 'Copying Files to a Compute Instance',
      to: 'https://www.youtube.com/watch?v=lMC5VNoZFhg',
    },
    {
      external: true,
      text: 'How to use SSH',
      to:
        'https://www.youtube.com/watch?v=ZVMckBHd7WA&list=PLTnRtjQN5ieb4XyvC9OUhp7nxzBENgCxJ&index=2',
    },
  ],
  moreInfo: {
    text: youtubeMoreLinkText,
    to: youtubeChannelLink,
  },
  title: 'Video Playlist',
};

export const linkAnalyticsEvent: ResourcesLinks['linkAnalyticsEvent'] = {
  action: 'Click:link',
  category: 'Linodes landing page empty',
};
