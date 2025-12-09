import * as React from 'react';
import { useArgs } from 'storybook/preview-api';

import { PaginationControls } from './PaginationControls';

import type { Meta, StoryObj } from '@storybook/react-vite';

type Story = StoryObj<typeof PaginationControls>;

export const PaginationControl: Story = {
  args: {
    count: 250,
    page: 1,
    pageSize: 25,
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [, setArgs] = useArgs();

    return (
      <PaginationControls
        {...args}
        onClickHandler={(page) => setArgs({ page })}
      />
    );
  },
};

const meta: Meta<typeof PaginationControls> = {
  component: PaginationControls,
  title: 'Components/Pagination Control',
};

export default meta;
