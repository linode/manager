import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';

import type { CopyTooltipProps } from './CopyTooltip';
import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<CopyTooltipProps> = {
  render: (args) => <CopyTooltip {...args} />,
};

export const WithCopyableText: StoryObj<CopyTooltipProps> = {
  render: (args) => <CopyTooltip {...args} copyableText text="Copyable Text" />,
};

const meta: Meta<CopyTooltipProps> = {
  argTypes: {
    onClickCallback: { action: 'clicked, text copied' },
  },
  args: {
    copyableText: false,
    onClickCallback: undefined,
    text: 'Copyable Text',
  },
  component: CopyTooltip,
  title: 'Components/Tooltip/Copy Tooltip',
};
export default meta;
