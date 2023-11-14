import { Typography } from '@mui/material';
import React from 'react';

import { Box } from 'src/components/Box';

import Select from './Select';

import type { BaseSelectProps } from './Select';
import type { Meta, StoryObj } from '@storybook/react';

interface Item {
  label: string;
  value: string;
}

export const Default: StoryObj<BaseSelectProps<Item, boolean, boolean>> = {
  render: (args) => {
    const SelectWrapper = () => {
      const { isMulti } = args;
      const [selectedItem, setSelectedItem] = React.useState<Item | null>(null);
      const [selectedItems, setSelectedItems] = React.useState<Item[] | null>(
        []
      );

      const handleSelect = (item: Item) => {
        setSelectedItem(item);
      };

      const handleMultiSelect = (items: Item[]) => {
        setSelectedItems(items);
      };

      React.useEffect(() => {
        setSelectedItem(null);
        setSelectedItems(null);
      }, [isMulti]);

      return (
        <Box sx={{ minHeight: 300 }}>
          <Select
            {...args}
            onChange={isMulti ? handleMultiSelect : handleSelect}
            placeholder={isMulti ? 'Choose your fruits' : 'Choose your fruit'}
            value={isMulti ? selectedItems : selectedItem}
          />
          {isMulti && selectedItems?.length && selectedItems?.length > 0 ? (
            <Typography sx={{ marginTop: 2 }}>
              Selected Items: {selectedItems.map((item) => item.label)}
            </Typography>
          ) : (
            selectedItem && (
              <Typography sx={{ marginTop: 2 }}>
                Selected Item: {selectedItem?.label}
              </Typography>
            )
          )}
        </Box>
      );
    };

    return SelectWrapper();
  },
};

const fruits: Item[] = [
  {
    label: 'Apple',
    value: 'apple',
  },
  {
    label: 'Pear',
    value: 'pear',
  },
  {
    label: 'Mango',
    value: 'mango',
  },
  {
    label: 'Durian',
    value: 'durian',
  },
  {
    label: 'Strawberry',
    value: 'strawberry',
  },
];

const meta: Meta<BaseSelectProps<Item, boolean, boolean>> = {
  args: {
    isClearable: true,
    isMulti: false,
    label: 'Fruit',
    options: fruits,
  },
  component: Select,
  title: 'Components/Selects/Enhanced Select',
};
export default meta;
