import { Event } from '@linode/api-v4/lib/account';
import { render } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { entityFactory, eventFactory } from 'src/factories/events';
import getEventMessage, {
  applyLinkingAndBolding,
  eventMessageCreators,
  safeSecondaryEntityLabel,
} from './eventMessageGenerator';

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe('Event message generation', () => {
  describe('getEventMessage', () => {
    it('should filter unknown events', () => {
      const mockEvent = {
        action: '__unknown__',
        status: 'started',
      };
      const result = getEventMessage(mockEvent as Event);

      expect(result).toBe('__unknown__');
    });

    it('should filter mangled events', () => {
      const mockEvent = {
        action: 'linode_reboot',
        status: 'scheduled',
        entity: null,
      };

      const { container } = render(<>{getEventMessage(mockEvent as Event)}</>);

      expect(container.firstElementChild?.innerHTML).toBe('""');
    });

    it('should call the message generator with the event', () => {
      const mockEvent = {
        action: 'linode_reboot',
        status: 'scheduled',
        entity: { label: 'test-linode-123' },
      };

      /** Mock the message creator */
      eventMessageCreators.linode_reboot.scheduled = jest.fn();

      /** Invoke the function. */
      getEventMessage(mockEvent as Event);

      /** Check that the mocked creator was called w/ the mock event. */
      expect(eventMessageCreators.linode_reboot.scheduled).toHaveBeenCalledWith(
        mockEvent
      );
    });
  });

  describe('safeSecondaryEventLabel', () => {
    it('should return a correct message if the secondary entity is present', () => {
      const mockEventWithSecondaryEntity = eventFactory.build({
        secondary_entity: entityFactory.build({ label: 'secondary-entity' }),
      });
      expect(
        safeSecondaryEntityLabel(
          mockEventWithSecondaryEntity,
          'booted with',
          'booted'
        )
      ).toMatch('booted with secondary-entity');
    });

    it('should return a safe default if the secondary entity is null', () => {
      const mockEventWithoutSecondaryEntity = eventFactory.build({
        secondary_entity: null,
      });
      expect(
        safeSecondaryEntityLabel(
          mockEventWithoutSecondaryEntity,
          'booted with',
          'booted'
        )
      ).toMatch('booted');
      expect(
        safeSecondaryEntityLabel(
          mockEventWithoutSecondaryEntity,
          'booted with',
          'booted'
        )
      ).not.toMatch('booted with');
    });
  });

  describe('apply linking to labels', () => {
    const entity = entityFactory.build({ id: 10, label: 'foo' });

    it('should return empty string if message is falsy', () => {
      const mockEvent = eventFactory.build({ action: 'domain_record_create' });
      const message = null;
      const { getByText } = render(
        applyLinkingAndBolding(mockEvent, message as any)
      );

      getByText(`""`);
    });

    it('should replace entity label with link if entity and link exist', async () => {
      const mockEvent = eventFactory.build({ entity });
      const message = 'created entity foo';
      const { getByRole } = render(
        <BrowserRouter>
          {applyLinkingAndBolding(mockEvent, message)}
        </BrowserRouter>
      );

      expect(getByRole('link').parentNode).toHaveTextContent(message);
      expect(getByRole('link')).toHaveAttribute('href', '/linodes/10');
    });

    it('should replace secondary entity label with link if entity and link exist', () => {
      const mockEvent = eventFactory.build({ entity });
      const message = 'created secondary_entity for foo';
      const { getByRole } = render(
        <BrowserRouter>
          {applyLinkingAndBolding(mockEvent, message)}
        </BrowserRouter>
      );

      expect(getByRole('link').parentNode).toHaveTextContent(message);
      expect(getByRole('link')).toHaveAttribute('href', '/linodes/10');
    });

    it('should replace backticks with code tag', () => {
      const mockEvent = eventFactory.build({ entity });
      const message = 'created `foo`';
      const { container } = render(applyLinkingAndBolding(mockEvent, message));

      // eslint-disable-next-line xss/no-mixed-html
      expect(container.firstElementChild).toContainHTML('<code>foo</code>');
    });

    it('should escape regex special characters', () => {
      const mockEvent = eventFactory.build({ entity });
      const message = 'created entity foo with special characters...(?)';

      const { getByRole } = render(
        <BrowserRouter>
          {applyLinkingAndBolding(mockEvent, message)}
        </BrowserRouter>
      );

      expect(getByRole('link').parentNode).toHaveTextContent(message);
    });

    it('should work when label is null', () => {
      const mockEvent = eventFactory.build({ entity });
      const message = 'created entity Null label';

      const { container } = render(applyLinkingAndBolding(mockEvent, message));

      expect(container.firstElementChild).toHaveTextContent(message);
    });
  });
});
