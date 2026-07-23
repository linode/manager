import { sendEvent } from '@akamai/compute-ui-core/analytics';

export const sendHelpButtonClickEvent = (url: string, from?: string) => {
  sendEvent({
    action: url,
    category: 'Help Button',
    label: from,
  });
};
