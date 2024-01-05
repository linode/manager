import { Event, EventAction } from '@linode/api-v4/lib/account';

export const maybeRemoveTrailingPeriod = (string: string) => {
  const lastChar = string[string.length - 1];
  if (lastChar === '.') {
    return string.substr(0, string.length - 1);
  }
  return string;
};

const ACTIONS_WITHOUT_USERNAMES = [
  'entity_transfer_accept',
  'entity_transfer_accept_recipient',
  'entity_transfer_cancel',
  'entity_transfer_create',
  'entity_transfer_fail',
  'entity_transfer_stale',
  'lassie_reboot',
];

export const formatEventWithUsername = (
  action: EventAction,
  username: null | string,
  message: string
) => {
  return username &&
    !ACTIONS_WITHOUT_USERNAMES.includes(action) &&
    !message.includes(`by **${username}**`)
    ? /*
        The event message for Lassie events already includes "by the Lassie Watchdog service" and event messages
        formatted with appended text may already include a username, so we don't want to add "by Linode" after that.
      */
      `${maybeRemoveTrailingPeriod(message)} by **${username}**.`
    : message;
};

export const formatEventWithAppendedText = (
  event: Event,
  message: string,
  text: string,
  link?: string
) => {
  if (!message) {
    return '';
  }
  const messageWithUsername = formatEventWithUsername(
    event.action,
    event.username,
    message
  );
  const appendedMessage = link
    ? `<a href="${link}" target=_blank>${text}</a>`
    : text;
  return `${messageWithUsername} ${maybeRemoveTrailingPeriod(
    appendedMessage
  )}.`;
};
