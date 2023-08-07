import { Event } from '@linode/api-v4/lib/account';
import React from 'react';

import { Chip } from 'src/components/Chip';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';

import { eventMessageCreators } from './eventMessageGenerator';

import type { CreatorsForStatus } from './eventMessageGenerator';
import type { Meta, StoryObj } from '@storybook/react';

// type Status = keyof CreatorsForStatus;

// const eventStatuses: Status[] = [
//   'failed',
//   'finished',
//   'notification',
//   'scheduled',
//   'started',
// ];

const renderEventMessages = (eventMessageCreators: {
  [index: string]: CreatorsForStatus;
}) => {
  return (
    <div>
      {Object.entries(eventMessageCreators).map(([eventKey, statuses]) => (
        <div key={eventKey ?? ''}>
          <h3>{eventKey}</h3>
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
                const message = messageCreator({
                  entity: { label: '{Entity Label}' },
                } as Event);

                return (
                  <TableRow key={`status-${key}`}>
                    <TableCell>
                      <Chip label={status} />{' '}
                    </TableCell>
                    <TableCell>
                      <span
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

export const Default: StoryObj<any> = {
  render: () => renderEventMessages(eventMessageCreators),
};

const meta: Meta<any> = {
  args: {},
  title: 'Features/Events',
};
export default meta;
