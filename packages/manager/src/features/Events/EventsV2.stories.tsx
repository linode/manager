import React from 'react';

import { Chip } from 'src/components/Chip';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { eventFactory } from 'src/factories/events';
import { eventMessages } from 'src/features/Events/factory';

import type { CompleteEventMap } from './types';
import type { Event } from '@linode/api-v4/lib/account';
import type { Meta, StoryObj } from '@storybook/react';

const event: Event = eventFactory.build({
  action: 'linode_boot',
  entity: {
    id: 1,
    label: '{entity}',
    type: 'linode',
    url: 'https://google.com',
  },
  message: '{message}',
  secondary_entity: {
    id: 1,
    label: '{secondary entity}',
    type: 'linode',
    url: 'https://google.com',
  },
  status: '{status}' as Event['status'],
  username: '{username}',
});

const renderEventMessages = (events: CompleteEventMap) => {
  return (
    <div>
      {Object.entries(events).map(([eventKey, statuses]) => (
        <div key={eventKey}>
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
                const message = statuses[status](event);

                return (
                  <TableRow key={`status-${key}`}>
                    <TableCell>
                      <Chip label={status} />
                    </TableCell>
                    <TableCell>
                      <Typography>{message}</Typography>
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
  render: () => renderEventMessages(eventMessages),
};

// const customizableEvent: Event = eventFactory.build();

// export const EventPlayground: StoryObj = {
//   argTypes: {
//     action: {
//       control: 'select',
//       options: EVENT_ACTIONS,
//     },
//     status: {
//       control: 'select',
//       options: EVENT_STATUSES,
//     },
//   },
//   args: {
//     ...customizableEvent,
//   },
//   render: (args) => factorEventMessage(args),
// };

/**
 * This renderer only loops through hard coded messages defined in `eventMessageCreators`.
 * This means that it will not render messages coming straight from the API and therefore
 * isn't an exhaustive list of all possible events.
 *
 * However a playground is available to generate message from a custom Event for testing purposes
 */

const meta: Meta<any> = {
  args: {},
  title: 'Features/EventsV2',
};

export default meta;
