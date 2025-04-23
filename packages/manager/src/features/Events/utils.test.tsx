import { DateTime } from 'luxon';

import { eventFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  formatEventTimeRemaining,
  formatProgressEvent,
  getEventMessage,
  getEventUsername,
} from './utils';

import type { Event } from '@linode/api-v4';

describe('getEventMessage', () => {
  const mockEvent1: Event = eventFactory.build({
    action: 'linode_create',
    entity: {
      id: 123,
      label: 'test-linode',
    },
    status: 'finished',
  });

  const mockEvent2: Event = eventFactory.build({
    action: 'linode_config_create',
    entity: {
      id: 123,
      label: 'test-linode',
      type: 'linode',
    },
    secondary_entity: {
      id: 456,
      label: 'test-config',
      type: 'linode',
    },
    status: 'notification',
  });

  it('returns the correct message for a given event', () => {
    const message = getEventMessage(mockEvent1);

    const { container, getByRole } = renderWithTheme(message);

    expect(container.querySelector('span')).toHaveTextContent(
      /Linode test-linode has been created./i
    );
    expect(container.querySelector('strong')).toHaveTextContent('created');
    expect(getByRole('link')).toHaveAttribute('href', '/linodes/123');
  });

  it('returns the correct message for a given event with a secondary entity', () => {
    const message = getEventMessage(mockEvent2);

    const { container, getAllByRole } = renderWithTheme(message);

    expect(container.querySelector('span')).toHaveTextContent(
      /Config test-config has been created on Linode test-linode./i
    );
    expect(container.querySelector('strong')).toHaveTextContent('created');

    const links = getAllByRole('link');
    expect(links.length).toBe(2);
    expect(links[0]).toHaveAttribute('href', '/linodes/456');
    expect(links[1]).toHaveAttribute('href', '/linodes/123');
  });

  it('returns the correct message for a manual input event', () => {
    const message = getEventMessage({
      action: 'linode_create',
      entity: {
        id: 123,
        label: 'test-linode',
        type: 'linode',
      },
      status: 'failed',
    });

    const { container } = renderWithTheme(message);

    expect(container.querySelector('span')).toHaveTextContent(
      /Linode test-linode could not be created./i
    );

    const boldedWords = container.querySelectorAll('strong');
    expect(boldedWords).toHaveLength(2);
    expect(boldedWords[0]).toHaveTextContent('not');
    expect(boldedWords[1]).toHaveTextContent('created');
  });
});

describe('getEventUsername', () => {
  it('returns the username if it exists and action is not in ACTIONS_WITHOUT_USERNAMES', () => {
    const mockEvent: Event = eventFactory.build({
      action: 'linode_create',
      entity: {
        id: 123,
        label: 'test-linode',
      },
      status: 'finished',
      username: 'test-user',
    });

    expect(getEventUsername(mockEvent)).toBe('test-user');
  });

  it('returns "Linode" if the username exists but action is in ACTIONS_WITHOUT_USERNAMES', () => {
    const mockEvent: Event = eventFactory.build({
      action: 'community_like',
      entity: {
        id: 234,
        label: '1 user liked your answer to: this question?',
        url: 'https://google.com/',
      },
      status: 'notification',
      username: 'test-user',
    });

    expect(getEventUsername(mockEvent)).toBe('Akamai');
  });

  it('returns "Linode" if the username does not exist', () => {
    const mockEvent: Event = eventFactory.build({
      status: 'notification',
      username: null,
    });

    expect(getEventUsername(mockEvent)).toBe('Akamai');
  });

  it('returns "Linode" if the username does not exist and action is in ACTIONS_WITHOUT_USERNAMES', () => {
    const mockEvent: Event = eventFactory.build({
      action: 'community_like',
      entity: {
        id: 234,
        label: '1 user liked your answer to: this question?',
        url: 'https://google.com/',
      },
      status: 'notification',
      username: null,
    });

    expect(getEventUsername(mockEvent)).toBe('Akamai');
  });
});

describe('formatEventTimeRemaining', () => {
  it('returns null if the time is null', () => {
    expect(formatEventTimeRemaining(null)).toBeNull();
  });

  it('returns null if the time is not formatted correctly', () => {
    expect(formatEventTimeRemaining('12:34')).toBeNull();
  });

  it('returns the formatted time remaining', () => {
    expect(formatEventTimeRemaining('0:45:31')).toBe('46 minutes remaining');
  });

  it('returns the formatted time remaining', () => {
    expect(formatEventTimeRemaining('1:23:45')).toBe('1 hour remaining');
  });
});

describe('formatProgressEvent', () => {
  const mockEvent1: Event = eventFactory.build({
    action: 'linode_create',
    entity: {
      id: 123,
      label: 'test-linode',
    },
    percent_complete: null,
    status: 'finished',
  });

  const mockEvent2: Event = eventFactory.build({
    action: 'linode_create',
    entity: {
      id: 123,
      label: 'test-linode',
    },
    percent_complete: 50,
    status: 'started',
  });

  it('returns the correct format for a finished Event', () => {
    const currentDateMock = DateTime.fromISO(mockEvent1.created).plus({
      seconds: 1,
    });
    vi.setSystemTime(currentDateMock.toJSDate());
    const { progressEventDate, showProgress } = formatProgressEvent(mockEvent1);

    expect(progressEventDate).toBe('1 second ago');
    expect(showProgress).toBe(false);
  });

  it('returns the correct format for a "started" event without time remaining info', () => {
    const currentDateMock = DateTime.fromISO(mockEvent2.created).plus({
      seconds: 1,
    });
    vi.setSystemTime(currentDateMock.toJSDate());
    const { progressEventDate, showProgress } = formatProgressEvent(mockEvent2);

    expect(progressEventDate).toBe('Started 1 second ago');
    expect(showProgress).toBe(true);
  });

  it('returns the correct format for a "started" event with time remaining', () => {
    const { progressEventDuration, showProgress } = formatProgressEvent({
      ...mockEvent2,

      time_remaining: '0:50:00',
    });
    expect(progressEventDuration).toBe('~50 minutes remaining');
    expect(showProgress).toBe(true);
  });
});
