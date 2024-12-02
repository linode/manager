import { Chip, Typography } from '@linode/ui';
import React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { eventFactory } from 'src/factories/events';
import { eventMessages } from 'src/features/Events/factory';

import type { EventMessage } from './types';
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
  message: 'message with a `ticked` word - please contact Support',
  secondary_entity: {
    id: 1,
    label: '{secondary entity}',
    type: 'linode',
    url: 'https://google.com',
  },
  status: '{status}' as Event['status'],
  username: '{username}',
});

/**
 * This story loops through all the known event messages keys, and displays their Cloud Manager message in a table.
 */
export const EventMessages: StoryObj = {
  render: () => (
    <div>
      {Object.entries(eventMessages).map(([eventKey, statuses]) => (
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
              {Object.keys(statuses).map((status: keyof EventMessage, key) => {
                const message = statuses[status]?.(event);

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
  ),
};

const meta: Meta<any> = {
  args: {},
  title: 'Features/Event Messages',
};

export default meta;
