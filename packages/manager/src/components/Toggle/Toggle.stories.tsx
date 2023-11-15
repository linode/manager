import React from 'react';

import { Toggle } from './Toggle';

import type { ToggleProps } from './Toggle';
import type { Meta, StoryObj } from '@storybook/react';

const EXAMPLE_TEXT = 'This is some example text for the toggle's tooltip';

export const Default: StoryObj<ToggleProps> = {
  render: () => <Toggle />,
};

/**
 * Example of a Toggle with a non-interactable tooltip
 */
export const TooltipToggle: StoryObj<ToggleProps> = {
  render: () => <Toggle tooltipText={EXAMPLE_TEXT} />,
};

/**
 * Example of a Toggle with an interactable tooltip
 */
export const InteractableTooltipToggle: StoryObj<ToggleProps> = {
  render: () => <Toggle interactive={true} tooltipText={EXAMPLE_TEXT} />,
};

const meta: Meta<ToggleProps> = {
  component: Toggle,
  title: 'Components/Toggle',
};

export default meta;
