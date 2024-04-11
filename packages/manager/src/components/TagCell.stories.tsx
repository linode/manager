import { useArgs } from '@storybook/preview-api';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Box } from 'src/components/Box';

import { TagCell, TagCellProps } from './TagCell/TagCell';

const _tags: string[] = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'];

export const Default: StoryObj<TagCellProps> = {
  render: (args) => {
    const TagsInputWrapper = () => {
      const [{ tags }, updateArgs] = useArgs();
      const handleUpdateTags = (selected: string[]) => {
        return Promise.resolve(updateArgs({ tags: selected }));
      };

      return (
        <Box sx={{ height: 300 }}>
          <TagCell {...args} tags={tags} updateTags={handleUpdateTags} />
        </Box>
      );
    };

    return TagsInputWrapper();
  },
};

export const InlineView: StoryObj<TagCellProps> = {
  render: (args) => {
    const TagsInputWrapper = () => {
      const [{ tags }, updateArgs] = useArgs();
      const handleUpdateTags = (selected: string[]) => {
        return Promise.resolve(updateArgs({ tags: selected }));
      };

      return (
        <Box sx={{ height: 300 }}>
          <TagCell
            {...args}
            listAllTags={() => undefined}
            tags={tags}
            updateTags={handleUpdateTags}
          />
        </Box>
      );
    };

    return TagsInputWrapper();
  },
};

const meta: Meta<TagCellProps> = {
  args: {
    disabled: false,
    tags: _tags,
  },
  component: TagCell,
  title: 'Components/Tags/Tag Cell',
};
export default meta;
