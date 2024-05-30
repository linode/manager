import { screen } from '@testing-library/react';
import * as React from 'react';

import { eventFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { EventMessageLink } from './EventMessageLink';

import type { Event } from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  getLinkForEvent: vi.fn().mockReturnValue('mockEntityUrl'),
}));

vi.mock('src/utilities/getEventsActionLink', async () => {
  const actual = await vi.importActual('src/utilities/getEventsActionLink');
  return {
    ...actual,
    getLinkForEvent: queryMocks.getLinkForEvent,
  };
});

describe('EventMessageLink', () => {
  it('renders null when provided with invalid props', () => {
    const { container } = renderWithTheme(
      <EventMessageLink
        event={eventFactory.build({
          entity: null,
          secondary_entity: null,
        })}
        to="entity"
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the entity label when provided with valid props', () => {
    queryMocks.getLinkForEvent.mockReturnValue('mockEntityUrl');
    const mockEvent: Event = eventFactory.build({
      entity: {
        label: 'mockEntityLabel',
        url: 'mockEntityUrl',
      },
    });
    renderWithTheme(<EventMessageLink event={mockEvent} to="entity" />);

    expect(screen.getByText('mockEntityLabel')).toBeInTheDocument();
  });

  it('renders the secondary entity label when provided with valid props', () => {
    queryMocks.getLinkForEvent.mockReturnValue('mockSecondaryEntityUrl');
    const mockEvent = eventFactory.build({
      entity: null,
      secondary_entity: {
        label: 'mockSecondaryEntityLabel',
        url: 'mockSecondaryEntityUrl',
      },
    });

    renderWithTheme(
      <EventMessageLink event={mockEvent} to="secondaryEntity" />
    );

    expect(screen.getByText('mockSecondaryEntityLabel')).toBeInTheDocument();
  });
});
