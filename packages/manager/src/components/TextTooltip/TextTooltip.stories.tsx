import { Typography } from '@linode/ui';
import React from 'react';

import { TextTooltip } from './TextTooltip';

import type { TextTooltipProps } from './TextTooltip';
import type { Meta, StoryObj } from '@storybook/react';

/** Default TextTooltip */
export const Default: StoryObj<TextTooltipProps> = {
  render: (args) => (
    <Typography>
      This paragraph contains a{' '}
      <TextTooltip
        {...args}
        displayText={args.displayText}
        tooltipText={args.tooltipText}
      />{' '}
      component.
    </Typography>
  ),
};

/** TextTooltip  with customized width and placement */
export const Customized: StoryObj<TextTooltipProps> = {
  render: (args) => (
    <Typography>
      This paragraph contains a{' '}
      <TextTooltip
        {...args}
        displayText={args.displayText}
        minWidth={'auto'}
        placement="top"
        tooltipText={args.tooltipText}
      />{' '}
      component.
    </Typography>
  ),
};

const meta: Meta<TextTooltipProps> = {
  args: {
    displayText: 'tooltip text',
    minWidth: 375,
    tooltipText: 'This is the tooltip content',
  },
  component: TextTooltip,
  title: 'Components/Tooltip/Text Tooltip',
};
export default meta;
