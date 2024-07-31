import { action } from '@storybook/addon-actions';
import React from 'react';

import { TextFieldHelperText } from 'src/components/TextField/TextFieldHelperText';

import type { Meta, StoryFn, StoryObj } from '@storybook/react';
import type { TextFieldHelperTextProps } from 'src/components/TextField/TextFieldHelperText';

// Story Config ========================================================

const meta: Meta<TextFieldHelperTextProps> = {
  component: TextFieldHelperText,
  decorators: [
    (Story: StoryFn) => (
      <div style={{ marginLeft: '2em', minHeight: 270 }}>
        <Story />
      </div>
    ),
  ],
  title: 'Components/TextField/TextFieldHelperText',
};

export default meta;

type Story = StoryObj<typeof TextFieldHelperText>;

// Story Definitions ==========================================================

export const Default: Story = {
  args: {
    content: [
      'Endpoint types impact the performance, capacity, and rate limits for your bucket. Understand ',
      {
        onClick: action('onClick'),
        text: 'endpoint types',
        to: '#',
      },
      '.',
    ],
  },
};

export const MultipleLinks: Story = {
  args: {
    content: [
      'This is a text with ',
      {
        onClick: action('onClick1'),
        text: 'multiple links',
        to: '#',
      },
      '. You can click on ',
      {
        onClick: action('onClick2'),
        text: 'this link',
        to: '#',
      },
      ' or ',
      {
        onClick: action('onClick3'),
        text: 'that link',
        to: '#',
      },
      '.',
    ],
  },
};

export const NoLinks: Story = {
  args: {
    content: ['This is a simple text without any links.'],
  },
};
