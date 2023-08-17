import React from 'react';

import { Chip } from 'src/components/Chip';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { eventFactory } from 'src/factories/events';
import { formatEventWithUsername } from 'src/features/Events/Event.helpers';
import { unsafe_MarkdownIt } from 'src/utilities/markdown';

import { EVENT_ACTIONS, EVENT_STATUSES } from './constants';
import {
  applyBolding,
  applyLinking,
  eventMessageCreators,
  generateEventMessage,
} from './eventMessageGenerator';

import type { CreatorsForStatus } from './eventMessageGenerator';
import type { Event } from '@linode/api-v4/lib/account';
import type { Meta, StoryObj } from '@storybook/react';

const event: Event = eventFactory.build({
  action: 'linode_boot',
  entity: { id: 1, label: '{Entity}', type: 'any', url: 'https://google.com' },
  message: '{Message}',
  secondary_entity: {
    id: 1,
    label: '{Secondary Entity}',
    type: 'linode',
    url: 'https://google.com',
  },
  status: '{Status}' as Event['status'],
  username: '{Username}',
});

const renderEventMessages = (eventMessageCreators: {
  [index: string]: CreatorsForStatus;
}) => {
  return (
    <div>
      {Object.entries(eventMessageCreators).map(([eventKey, statuses]) => (
        <div key={eventKey ?? ''}>
          <Typography sx={{ marginBottom: 1, marginTop: 2 }} variant="h3">
            {eventKey}
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ width: '15%' }}>Status</TableCell>
                <TableCell>Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(statuses).map((status, key) => {
                const messageCreator = statuses[status];

                let message = messageCreator(event);
                message = applyBolding(message);
                message = formatEventWithUsername(
                  event.action,
                  event.username,
                  message
                );
                // eslint-disable-next-line xss/no-mixed-html
                message = unsafe_MarkdownIt.render(message);
                message = applyLinking(event, message);

                return (
                  <TableRow key={`status-${key}`}>
                    <TableCell>
                      <Chip label={status} />{' '}
                    </TableCell>
                    <TableCell>
                      <Typography
                        dangerouslySetInnerHTML={{
                          // eslint-disable-next-line xss/no-mixed-html
                          __html: message,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
};

export const HardCodedMessages: StoryObj = {
  render: () => renderEventMessages(eventMessageCreators),
};

const customizableEvent: Event = eventFactory.build();

export const EventPlayground: StoryObj = {
  argTypes: {
    action: {
      control: 'select',
      options: EVENT_ACTIONS,
    },
    status: {
      control: 'select',
      options: EVENT_STATUSES,
    },
  },
  args: {
    ...customizableEvent,
  },
  render: (args) => (
    <Typography
      dangerouslySetInnerHTML={{
        // eslint-disable-next-line xss/no-mixed-html
        __html: unsafe_MarkdownIt.render(
          generateEventMessage({ ...customizableEvent, ...args })
        ),
      }}
    />
  ),
};

/**
 * This renderer only loops through hard coded messages defined in `eventMessageCreators`.
 * This means that it will not render messages coming straight from the API and therefore
 * isn't an exhaustive list of all possible events.
 *
 * However a playground is available to generate message from a custom Event for testing purposes
 */

const meta: Meta<any> = {
  args: {},
  title: 'Features/Events',
};

export default meta;
