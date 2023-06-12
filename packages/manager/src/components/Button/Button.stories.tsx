import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    tooltipGAEvent: {
      action: 'GA Event Action',
    },
  },
  args: {
    buttonType: 'primary',
    children: 'Button',
    compactX: false,
    compactY: false,
    disabled: false,
    loading: false,
    sx: {},
    tooltipText: '',
    tooltipGAEvent: action('tooltipGAEvent'),
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {},
  render: (args) => <Button {...args} />,
};

export const Secondary: Story = {
  args: {
    buttonType: 'secondary',
  },
  render: (args) => <Button {...args} />,
};

export const Outlined: Story = {
  args: {
    buttonType: 'outlined',
  },
  render: (args) => <Button {...args} />,
};
