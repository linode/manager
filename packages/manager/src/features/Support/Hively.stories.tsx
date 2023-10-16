import React from 'react';

import { Hively } from './Hively';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Hively> = {
  args: {
    linodeUsername: 'linodeuser',
    replyId: '123',
    ticketId: '123',
  },
  component: Hively,
  title: 'Components/Hively',
};

export default meta;

type Story = StoryObj<typeof Hively>;

export const Default: Story = {
  args: {},
  render: (args) => <Hively {...args} />,
};
