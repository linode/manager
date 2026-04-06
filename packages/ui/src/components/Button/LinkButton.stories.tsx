import React from 'react';

import { LinkButton } from './LinkButton';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof LinkButton> = {
  component: LinkButton,
  title: 'Foundations/Button/LinkButton',
};

export default meta;

type Story = StoryObj<typeof LinkButton>;

export const Default: Story = {
  args: {
    children: 'Click me!',
    onClick: () => alert('you clicked a LinkButton'),
  },
  render: (args) => <LinkButton {...args} />,
};

export const Disabled: Story = {
  args: {
    children: 'Click me!',
    disabled: true,
  },
  render: (args) => <LinkButton {...args} />,
};

export const Loading: Story = {
  args: {
    children: 'Click me!',
    isLoading: true,
    onClick: () => alert('you clicked a LinkButton'),
  },
  render: (args) => <LinkButton {...args} />,
};
