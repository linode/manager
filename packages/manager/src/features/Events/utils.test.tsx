import { Event } from '@linode/api-v4';

import { eventFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { getEventMessage } from './utils';

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

  it.only('returns the correct message for a given event with a secondary entity', () => {
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

    const { container, getByRole } = renderWithTheme(message);

    expect(container.querySelector('span')).toHaveTextContent(
      /Linode test-linode could not be created./i
    );

    const boldedWords = container.querySelectorAll('strong');
    expect(boldedWords).toHaveLength(2);
    expect(boldedWords[0]).toHaveTextContent('not');
    expect(boldedWords[1]).toHaveTextContent('created');

    expect(getByRole('link')).toHaveAttribute('href', '/linodes/123');
  });
});
