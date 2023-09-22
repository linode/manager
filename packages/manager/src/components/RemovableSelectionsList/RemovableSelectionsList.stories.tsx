/* eslint-disable @typescript-eslint/no-empty-function */
import * as React from 'react';

import { Button } from '../Button/Button';
import { RemovableSelectionsList } from './RemovableSelectionsList';

import type { RemovableItem } from './RemovableSelectionsList';
import type { Meta, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof RemovableSelectionsList>;

const defaultListItems = Array.from({ length: 20 }, (_, index) => {
  const num = index + 1;
  return { id: num, label: `my-linode-${num}` };
});

const diffLabelListItems = Array.from({ length: 5 }, (_, index) => {
  const num = index + 1;
  return {
    id: num,
    label: `my-linode-${num}`,
    preferredLabel: `my-linode-preferred-${num}`,
  };
});

/**
 * Interactable example of a RemovableSelectionsList
 */
export const InteractableDefault: Story = {
  render: () => {
    const RemovableSelectionsListWrapper = () => {
      const [data, setData] = React.useState(defaultListItems);

      const handleRemove = (item: RemovableItem) => {
        setData([...data].filter((data) => data.id !== item.id));
      };

      const resetList = () => {
        setData([...defaultListItems]);
      };

      return (
        <>
          <RemovableSelectionsList
            headerText="Linodes to remove"
            noDataText="No Linodes available"
            onRemove={handleRemove}
            selectionData={data}
          />
          <Button onClick={resetList} sx={{ marginTop: 2 }}>
            Reset list
          </Button>
        </>
      );
    };

    return <RemovableSelectionsListWrapper />;
  },
};

/**
 * Example of a RemovableSelectionsList with a specified label option
 * (no action will be performed when clicking on the list items)
 */
export const SpecifiedLabelExample: Story = {
  args: {
    headerText: 'Linodes to remove',
    noDataText: 'No Linodes available',
    onRemove: (_) => {},
    preferredDataLabel: 'preferredLabel',
    selectionData: diffLabelListItems,
  },
  render: (args) => {
    return <RemovableSelectionsList {...args} />;
  },
};

/**
 * Example of a RemovableSelectionsList with no data to remove
 */
export const NoDataExample: Story = {
  args: {
    headerText: 'Linodes to remove',
    noDataText: 'No Linodes available',
    onRemove: (_) => {},
    selectionData: [],
  },
  render: (args) => {
    return <RemovableSelectionsList {...args} />;
  },
};

const meta: Meta<typeof RemovableSelectionsList> = {
  component: RemovableSelectionsList,
  title: 'Components/RemovableSelectionsList',
};

export default meta;
