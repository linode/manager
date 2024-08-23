import { DateTime } from 'luxon';
import * as React from 'react';

import { DateTimeDisplay } from './DateTimeDisplay';

import type { Meta, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof DateTimeDisplay>;

export const Default: Story = {
  args: {
    displayTime: true,
    value: DateTime.now().minus({ day: 3 }).toISO(),
  },
  render: (args) => <DateTimeDisplay {...args} />,
};

const meta: Meta<typeof DateTimeDisplay> = {
  argTypes: {
    value: {
      control: {
        type: 'date',
      },
    },
  },
  component: DateTimeDisplay,
  title: 'Foundations/Typography/Date Time Display',
};

export default meta;
