import { AutocompleteProps } from '@mui/material/Autocomplete';
import React from 'react';

import { AutocompleteV2 } from './AutocompleteV2';

// import type { CombinedAutocompleteProps, OptionType } from './Autocomplete';
import type { Meta, StoryFn, StoryObj } from '@storybook/react';

export interface FruitProps {
  label: string;
  value: string;
}

const fruits: FruitProps[] = [
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

type Story = StoryObj<typeof AutocompleteV2>;

const meta: Meta<AutocompleteProps<FruitProps[], false, false, false>> = {
  argTypes: {},
  args: {},
  component: AutocompleteV2,
  title: 'Components/Autocomplete',
};

export default meta;

export const Default: Story = {
  args: {
    options: fruits,
  },
  render: (args) => <AutocompleteV2 {...args} />,
};
