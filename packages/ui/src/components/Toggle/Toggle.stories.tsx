import React from 'react';

import { Toggle } from './Toggle';

import type { ToggleProps } from './Toggle';
import type { Meta, StoryObj } from '@storybook/react';

const EXAMPLE_TEXT = "This is some example text for the toggle's tooltip";

export const Default: StoryObj<ToggleProps> = {
  render: (args) => <Toggle {...args} tooltipText={EXAMPLE_TEXT} />,
};

const meta: Meta<ToggleProps> = {
  args: {
    disabled: false,
  },
  component: Toggle,
  title: 'Foundations/Toggle',
};

export default meta;
