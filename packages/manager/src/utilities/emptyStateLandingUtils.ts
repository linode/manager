import { sendEvent } from 'src/utilities/analytics/utils';

export const guidesMoreLinkText = 'Check out all our Docs';
export const docsLink = 'https://www.linode.com/docs/';
export const youtubeMoreLinkText = 'View our YouTube channel';
export const youtubeChannelLink =
  'https://www.youtube.com/playlist?list=PLTnRtjQN5ieb4XyvC9OUhp7nxzBENgCxJ';

// retaining the old label for tracking
export const youtubeMoreLinkLabel = 'View the complete playlist';

interface AnalyticsEventTemplate {
  action: string;
  category: string;
}

export const getLinkOnClick =
  (linkAnalyticsEventTemplate: AnalyticsEventTemplate, linkText: string) =>
  () => {
    sendEvent({
      ...linkAnalyticsEventTemplate,
      label: linkText,
    });
  };
