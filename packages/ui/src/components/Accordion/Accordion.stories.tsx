import React from 'react';

import { Accordion } from './Accordion';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Accordion> = {
  component: Accordion,
  title: 'Foundations/Accordion',
};

type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  args: {
    children: <p>Any children can go here!</p>,
    heading: 'This is an Accordion',
  },
  render: (args) => <Accordion {...args} />,
};

export const WithHeadingNumberCount: Story = {
  args: {
    children: <p>Any children can go here!</p>,
    heading: 'This is an Accordion',
    headingNumberCount: 1,
  },
  render: (args) => <Accordion {...args} />,
};

export default meta;
