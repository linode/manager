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
      text: 'Overview of DNS Manager',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/dns-manager',
    },
    {
      text: 'Getting Started with DNS Manager',
      to:
        'https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-dns-manager',
    },
    {
      text: 'Create a Domain Zone',
      to: 'https://techdocs.akamai.com/cloud-computing/docs/create-a-domain',
    },
  ],
  moreInfo: {
    text: 'View additional DNS Manager guides',
    to: 'https://techdocs.akamai.com/cloud-computing/docs/dns-manager',
  },
  title: 'Getting Started Guides',
};

export const youtubeLinkData: ResourcesLinkSection = {
  links: [
    {
      external: true,
      text: 'Linode DNS Manager | Total Control Over Your DNS Records',
      to: 'https://www.youtube.com/watch?v=ganwcCm53Qs',
    },
    {
      external: true,
      text: 'Using Domains with Your Server | Common DNS Configurations',
      to: 'https://www.youtube.com/watch?v=Vb1JsfZlFLE',
    },
    {
      external: true,
      text: 'Connect a Domain to a Linode Server',
      to: 'https://www.youtube.com/watch?v=mKfx4ryuMtY',
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
  category: 'Domains landing page empty',
};
