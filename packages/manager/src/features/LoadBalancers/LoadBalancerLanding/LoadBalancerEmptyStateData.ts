import type {
  ResourcesHeaders,
  ResourcesLinkSection,
  ResourcesLinks,
} from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';

export const headers: ResourcesHeaders = {
  description:
    'Scalable Layer 4 . and Layer 7 load balancer to manage and accelerate enterprise traffic between clients and your distributed applications and networks globally.',
  subtitle: 'BETA',
  title: 'Global Load Balancers',
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
    {
      text: 'Overview',
      to:
        'https://www.linode.com/docs/products/networking/global-loadbalancer/',
    },
    {
      text: 'Get Started',
      to:
        'https://www.linode.com/docs/products/networking/global-loadbalancer/get-started/',
    },
    {
      text: 'Resources',
      to:
        'https://www.linode.com/docs/products/networking/global-loadbalancer/resources/',
    },
    {
      text: 'Developers',
      to:
        'https://www.linode.com/docs/products/networking/global-loadbalancer/developers/',
    },
  ],
  moreInfo: {
    text: 'Guides',
    to:
      'https://www.linode.com/docs/products/networking/global-loadbalancer/guides/',
  },
  title: 'Getting Started Guides',
};

export const youtubeLinkData: ResourcesLinkSection = {
  links: [
    {
      external: true,
      text: '',
      to: '',
    },
    {
      external: true,
      text: '',
      to: '',
    },
  ],
  moreInfo: {
    text: '',
    to: '',
  },
  title: 'Video Playlist',
};

export const linkAnalyticsEvent: ResourcesLinks['linkAnalyticsEvent'] = {
  action: 'Click:link',
  category: 'Load Balancer landing page empty',
};
