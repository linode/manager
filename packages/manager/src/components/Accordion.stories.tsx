import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Accordion } from './Accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
};

type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  render: (args) => <Accordion {...args} />,
  args: {
    heading: 'This is an Accordion',
    children: <p>Any children can go here!</p>,
  },
};

export default meta;
