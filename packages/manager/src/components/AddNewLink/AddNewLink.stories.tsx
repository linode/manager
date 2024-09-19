import { action } from '@storybook/addon-actions';

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
};

export const CustomDisplay = {
  args: {
    ...defaultArgs,
    display: 'test display',
  },
};

export const DisabledWithoutReason = {
  args: {
    ...defaultArgs,
    disabled: true,
  },
};

export const DisabledWithReason = {
  args: {
    ...defaultArgs,
    disabled: true,
    disabledReason: 'This is disabled',
  },
};

export default meta;
