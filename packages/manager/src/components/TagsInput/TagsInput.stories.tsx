import { useArgs } from '@storybook/client-api';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Box } from 'src/components/Box';

import { TagsInput } from './TagsInput';

import type { TagsInputProps } from './TagsInput';
import type { Item } from 'src/components/EnhancedSelect/Select';

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
      const handleUpdateTags = (selected: Item[]) => {
        return setTags({ value: selected });
      };

      return (
        <Box sx={{ alignItems: 'center', display: 'flex', height: 300 }}>
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
