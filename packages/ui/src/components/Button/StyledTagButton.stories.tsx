import { action } from '@storybook/addon-actions';
import React from 'react';

import { StyledPlusIcon, StyledTagButton } from './StyledTagButton';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof StyledTagButton> = {
  args: {
    children: 'Tag',
    disabled: false,
    onClick: () => null,
  },
  component: StyledTagButton,
  title: 'Components/Tags/TagButton',
};

export default meta;

type Story = StoryObj<typeof StyledTagButton>;

export const Default: Story = {
  args: {
    buttonType: 'outlined',
    children: 'Tag',
    disabled: false,
    onClick: action('onClick'),
  },
  render: (args) => (
    <StyledTagButton
      {...args}
      endIcon={<StyledPlusIcon disabled={args.disabled} />}
    >
      Add a Tag
    </StyledTagButton>
  ),
};
