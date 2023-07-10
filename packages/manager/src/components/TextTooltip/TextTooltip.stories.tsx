import React from 'react';
import { Typography } from 'src/components/Typography';
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
        tooltipText={args.tooltipText}
        placement="top"
        minWidth={'auto'}
      />{' '}
      component.
    </Typography>
  ),
};

const meta: Meta<TextTooltipProps> = {
  title: 'Components/Tooltip/Text Tooltip',
  args: {
    displayText: 'tooltip text',
    minWidth: 375,
    tooltipText: 'This is the tooltip content',
  },
  component: TextTooltip,
};
export default meta;
