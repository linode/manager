import { action } from '@storybook/addon-actions';
import { useArgs } from '@storybook/preview-api';
import * as React from 'react';

import { EditableText } from './EditableText';

import type { Meta, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof EditableText>;

export const Default: Story = {
  args: {
    onCancel: action('onCancel'),
    text: 'Edit me!',
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [, setLocalArgs] = useArgs();
    const onEdit = (updatedText: string) => {
      return Promise.resolve(setLocalArgs({ text: updatedText }));
    };

    return <EditableText {...args} onEdit={onEdit} />;
  },
};

export const WithSuffix: Story = {
  args: {
    onCancel: action('onCancel'),
    text: 'I have a suffix',
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [, setLocalArgs] = useArgs();
    const onEdit = (updatedText: string) => {
      return Promise.resolve(setLocalArgs({ text: updatedText }));
    };

    return (
      <EditableText {...args} onEdit={onEdit} textSuffix=" (I am the suffix)" />
    );
  },
};

const meta: Meta<typeof EditableText> = {
  component: EditableText,
  title: 'Components/Editable Text',
};

export default meta;
