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
      to: 'https://www.linode.com/docs/guides/creating-a-compute-instance/',
      text: 'Create a Compute Instance',
    },
    {
      to: 'https://www.linode.com/docs/guides/getting-started/',
      text: 'Getting Started with Linode Compute Instances',
    },
    {
      to:
        'https://www.linode.com/docs/guides/understanding-billing-and-payments/',
      text: 'Understanding Billing and Payment',
    },
    {
      to: 'https://www.linode.com/docs/guides/set-up-web-server-host-website/',
      text: 'Hosting a Website or Application on Linode',
    },
  ],
  moreInfo: {
    to: docsLink,
    text: guidesMoreLinkText,
  },
  title: 'Getting Started Guides',
};

export const youtubeLinkData: ResourcesLinkSection = {
  links: [
    {
      to: 'https://www.youtube.com/watch?v=KEK-ZxrGxMA',
      text: 'Linode Getting Started Guide',
      external: true,
    },
    {
      to: 'https://www.youtube.com/watch?v=AVXYq8aL47Q',
      text: 'Common Linux Commands',
      external: true,
    },
    {
      to: 'https://www.youtube.com/watch?v=lMC5VNoZFhg',
      text: 'Copying Files to a Compute Instance',
      external: true,
    },
    {
      to:
        'https://www.youtube.com/watch?v=ZVMckBHd7WA&list=PLTnRtjQN5ieb4XyvC9OUhp7nxzBENgCxJ&index=2',
      text: 'How to use SSH',
      external: true,
    },
  ],
  moreInfo: {
    to: youtubeChannelLink,
    text: youtubeMoreLinkText,
  },
  title: 'Video Playlist',
};

export const linkAnalyticsEvent: ResourcesLinks['linkAnalyticsEvent'] = {
  action: 'Click:link',
  category: 'Linodes landing page empty',
};
