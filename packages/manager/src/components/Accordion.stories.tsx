import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Accordion } from './Accordion';

const meta: Meta<typeof Accordion> = {
  component: Accordion,
  title: 'Components/Accordion',
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
