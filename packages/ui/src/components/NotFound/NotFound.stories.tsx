import React from 'react';

import { NotFound } from './NotFound';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof NotFound> = {
  component: NotFound,
  title: 'Components/NotFound',
};

type Story = StoryObj<typeof NotFound>;

export const Default: Story = {
  render: (args) => <NotFound {...args} />,
};

export default meta;
