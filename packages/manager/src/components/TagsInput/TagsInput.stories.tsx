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
      const [value, setValue] = React.useState<Item[]>(args.value);

      return (
        <Box sx={{ height: 300 }}>
          <TagsInput
            {...args}
            onChange={(selected) => setValue(selected)}
            value={value}
          />
        </Box>
      );
    };

    return TagsInputWrapper();
  },
};

const meta: Meta<TagsInputProps> = {
  component: TagsInput,
  title: 'Components/Tags/Tags Input 2',
};
export default meta;
