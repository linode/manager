import * as React from 'react';

import { PaginationControls } from './PaginationControls';

import type { Meta, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof PaginationControls>;

export const PaginationControl: Story = {
  args: {
    count: 250,
    pageSize: 25,
  },
  render: (args, context) => {
    return (
      <PaginationControls
        {...args}
        onClickHandler={context.setPage}
        page={context.page}
      />
    );
  },
};

const meta: Meta<typeof PaginationControls> = {
  component: PaginationControls,
  title: 'Components/Pagination Control',
};

export default meta;
