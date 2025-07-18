import { Box } from '@linode/ui';
import React from 'react';
import { useArgs } from 'storybook/preview-api';

import { TagsInput } from './TagsInput';

import type { TagOption, TagsInputProps } from './TagsInput';
import type { Meta, StoryObj } from '@storybook/react-vite';

export const Default: StoryObj<TagsInputProps> = {
  args: {
    disabled: false,
    hideLabel: false,
    label: '',
    menuPlacement: 'bottom',
    name: '',
    tagError: '',
    value: [
      { label: 'tag-1', value: 'tag-1' },
      { label: 'tag-2', value: 'tag-2' },
    ],
  },
  render: (args) => {
    const TagsInputWrapper = () => {
      const [, setTags] = useArgs();
      const handleUpdateTags = (selected: TagOption[]) => {
        return setTags({ value: selected });
      };

      return (
        <Box sx={{ alignItems: 'center', height: 300 }}>
          <TagsInput
            {...args}
            onChange={(selected) => handleUpdateTags(selected)}
          />
        </Box>
      );
    };

    return TagsInputWrapper();
  },
};

const meta: Meta<TagsInputProps> = {
  component: TagsInput,
  title: 'Components/Tags/Tags Input',
};
export default meta;
