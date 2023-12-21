import { useArgs } from '@storybook/client-api';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Box } from 'src/components/Box';

import { TagsPanel } from './TagsPanel';

import type { TagsPanelProps } from './TagsPanel';

const _tags: string[] = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'];

export const Default: StoryObj<TagsPanelProps> = {
  render: (args) => {
    const TagsInputWrapper = () => {
      const [{ tags }, updateArgs] = useArgs();
      const handleUpdateTags = (selected: string[]) => {
        return Promise.resolve(updateArgs({ tags: selected }));
      };

      return (
        <Box sx={{ height: 300 }}>
          <TagsPanel {...args} tags={tags} updateTags={handleUpdateTags} />
        </Box>
      );
    };

    return TagsInputWrapper();
  },
};

const meta: Meta<TagsPanelProps> = {
  args: {
    disabled: false,
    tags: _tags,
  },
  component: TagsPanel,
  title: 'Components/Tags/Tags Panel',
};
export default meta;
