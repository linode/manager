import { Event } from '@linode/api-v4/lib/account';
import React from 'react';

import { Chip } from 'src/components/Chip';
import List from 'src/components/core/List';
import ListItem from 'src/components/core/ListItem';

import { eventMessageCreators } from './eventMessageGenerator';

import type { CreatorsForStatus } from './eventMessageGenerator';
import type { Meta, StoryObj } from '@storybook/react';

type Status = keyof CreatorsForStatus;

const eventStatuses: Status[] = [
  'failed',
  'finished',
  'notification',
  'scheduled',
  'started',
];

const renderEventMessages = (eventMessageCreators: {
  [index: string]: CreatorsForStatus;
}) => {
  return (
    <div>
      {Object.entries(eventMessageCreators).map(([eventKey, statuses]) => (
        <div key={eventKey ?? ''}>
          <h3>
            <Chip label={eventKey} />
          </h3>
          <List>
            {Object.keys(statuses).map((status, key) => {
              const messageCreator = statuses[status];
              const message = messageCreator({
                entity: { label: '{Entity Label}' },
              } as Event);

              return (
                <ListItem key={`status-${key}`}>
                  {status}:{' '}
                  <span
                    dangerouslySetInnerHTML={{
                      // eslint-disable-next-line xss/no-mixed-html
                      __html: message,
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
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
