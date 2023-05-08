import {
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
    'A comprehensive, reliable, and fast DNS service that provides easy domain management for no additional cost.',

  subtitle: 'Easy domain management',
  title: 'Domains',
};

export const gettingStartedGuides: ResourcesLinkSection = {
  links: [
    {
      to: 'https://www.linode.com/docs/products/networking/dns-manager/',
      text: 'Overview of DNS Manager',
    },
    {
      to:
        'https://www.linode.com/docs/products/networking/dns-manager/get-started/',
      text: 'Getting Started with DNS Manager',
    },
    {
      to:
        'https://www.linode.com/docs/products/networking/dns-manager/guides/create-domain/',
      text: 'Create a Domain Zone',
    },
  ],
  moreInfo: {
    to: 'https://www.linode.com/docs/products/networking/dns-manager/guides/',
    text: 'View additional DNS Manager guides',
  },
  title: 'Getting Started Guides',
};

export const youtubeLinkData: ResourcesLinkSection = {
  links: [
    {
      to: 'https://www.youtube.com/watch?v=ganwcCm53Qs',
      text: 'Linode DNS Manager | Total Control Over Your DNS Records',
      external: true,
    },
    {
      to: 'https://www.youtube.com/watch?v=Vb1JsfZlFLE',
      text: 'Using Domains with Your Server | Common DNS Configurations',
      external: true,
    },
    {
      to: 'https://www.youtube.com/watch?v=mKfx4ryuMtY',
      text: 'Connect a Domain to a Linode Server',
      external: true,
    },
  ],
  moreInfo: {
    to: youtubeChannelLink,
    text: youtubeMoreLinkText,
  },
  title: 'Video Playlist',
};

export const linkGAEvent: ResourcesLinks['linkGAEvent'] = {
  action: 'Click:link',
  category: 'Domains landing page empty',
};
