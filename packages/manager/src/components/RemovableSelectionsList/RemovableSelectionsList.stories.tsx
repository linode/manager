/* eslint-disable @typescript-eslint/no-empty-function */
import { Button } from '@linode/ui';
import * as React from 'react';

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

interface Dimensions {
  maxHeight?: number;
  maxWidth?: number;
}
const DefaultRemovableSelectionsListWrapper = (props: Dimensions) => {
  const { maxHeight, maxWidth } = props;
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
        maxHeight={maxHeight}
        maxWidth={maxWidth}
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

/**
 * Interactable example of a RemovableSelectionsList
 */
export const InteractableDefault: Story = {
  render: () => <DefaultRemovableSelectionsListWrapper />,
};

/**
 * Example of a RemovableSelectionsList with a specified label option. Data passed in
 * has the shape of _{ id: number; label: string; preferredLabel: string; }_, where the
 * content in _preferredLabel_ is being rendered for each list item's label here.
 */
export const SpecifiedLabelExample: Story = {
  render: () => {
    const SpecifiedLabelWrapper = () => {
      const [data, setData] = React.useState(diffLabelListItems);

      const handleRemove = (item: RemovableItem) => {
        setData([...data].filter((data) => data.id !== item.id));
      };

      const resetList = () => {
        setData([...diffLabelListItems]);
      };

      return (
        <>
          <RemovableSelectionsList
            headerText="Linodes to remove"
            noDataText="No Linodes available"
            onRemove={handleRemove}
            preferredDataLabel="preferredLabel"
            selectionData={data}
          />
          <Button onClick={resetList} sx={{ marginTop: 2 }}>
            Reset list
          </Button>
        </>
      );
    };

    return <SpecifiedLabelWrapper />;
  },
};

/**
 * Example of a RemovableSelectionsList with a custom height and width
 */
export const CustomHeightAndWidth: Story = {
  render: () => (
    <DefaultRemovableSelectionsListWrapper maxHeight={300} maxWidth={200} />
  ),
};

/**
 * Example of a RemovableSelectionsList with no data to remove
 */
export const WithReadableRemoveCTA: Story = {
  render: () => {
    const SpecifiedLabelWrapper = () => {
      const [data, setData] = React.useState(diffLabelListItems);

      const handleRemove = (item: RemovableItem) => {
        setData([...data].filter((data) => data.id !== item.id));
      };

      const resetList = () => {
        setData([...diffLabelListItems]);
      };

      return (
        <>
          <RemovableSelectionsList
            RemoveButton={() => (
              <Button
                sx={(theme) => ({
                  font: theme.font.normal,
                  fontSize: '0.875rem',
                })}
                variant="text"
              >
                Remove
              </Button>
            )}
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

    return <SpecifiedLabelWrapper />;
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
  title: 'Components/Selects/RemovableSelectionsList',
};

export default meta;
