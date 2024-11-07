import { Box } from '@linode/ui';
import { useArgs } from '@storybook/preview-api';
import React from 'react';

import { TagCell } from './TagCell/TagCell';

import type { TagCellProps } from './TagCell/TagCell';
import type { Meta, StoryObj } from '@storybook/react';

const _tags: string[] = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'];

export const PanelView: StoryObj<TagCellProps> = {
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
            tags={tags}
            updateTags={handleUpdateTags}
            view={args.view ?? 'panel'}
          />
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
            tags={tags}
            updateTags={handleUpdateTags}
            view={args.view ?? 'inline'}
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
