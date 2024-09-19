import { action } from '@storybook/addon-actions';
import React from 'react';

import { AddNewLink } from './AddNewLink';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof AddNewLink> = {
  component: AddNewLink,
  title: 'Components/AddNewLink',
};

type Story = StoryObj<typeof AddNewLink>;

const defaultArgs = {
  label: 'test label',
  onClick: action('onClick'),
};

export const Default: Story = {
  args: defaultArgs,
  render: (args) => {
    return <AddNewLink {...args} />;
  },
};

export const CustomDisplay = {
  args: {
    ...defaultArgs,
    display: 'test display',
  },
};

export const Disabled = {
  args: {
    ...defaultArgs,
    disabled: true,
    disabledReason: 'This is disabled',
  },
  render: Default.render,
};

export default meta;
