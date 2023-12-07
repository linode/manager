import * as React from 'react';

import { PaginationControls } from './PaginationControls';

import type { Meta, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof PaginationControls>;

export const PaginationControl: Story = {
  args: {
    count: 250,
    page: 1,
    pageSize: 25,
  },
  render: (args) => {
    const PaginationControlsWrapper = () => {
      const [thisPage, setThisPage] = React.useState(args.page);

      const handlePageChange = (pgNum: number) => {
        setThisPage(pgNum);
      };

      return (
        <PaginationControls
          {...args}
          onClickHandler={handlePageChange}
          page={thisPage}
        />
      );
    };

    return <PaginationControlsWrapper />;
  },
};

const meta: Meta<typeof PaginationControls> = {
  component: PaginationControls,
  title: 'Components/Pagination Control',
};

export default meta;
