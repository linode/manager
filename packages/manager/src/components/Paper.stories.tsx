import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Paper } from './Paper';

const meta: Meta<typeof Paper> = {
  component: Paper,
  title: 'Components/Paper',
};

type Story = StoryObj<typeof Paper>;

export const Default: Story = {
  args: {
    children: 'This is text within a Paper',
  },
  render: (args) => <Paper {...args} />,
};

export const Error: Story = {
  args: {
    children: 'This is text within a Paper',
    error: 'This Paper has an error.',
  },
  render: (args) => <Paper {...args} />,
};

export const Outlined: Story = {
  args: {
    children: 'This is text within a Paper',
    variant: 'outlined',
  },
  render: (args) => <Paper {...args} />,
};

export default meta;
