import { action } from '@storybook/addon-actions';
import React from 'react';

import { Autocomplete } from './Autocomplete';

import type {
  AutocompleteMultiSelectProps,
  AutocompleteSingleSelectProps,
} from './Autocomplete';
import type { Meta, StoryObj } from '@storybook/react';

const fruits = [
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

const meta: Meta<
  AutocompleteMultiSelectProps | AutocompleteSingleSelectProps
> = {
  argTypes: {
    onSelectionChange: {
      action: 'onSelectionChange',
    },
  },
  args: {
    label: 'Select a Fruit',
    onSelectionChange: action('onSelectionChange'),
  },
  component: Autocomplete,
  title: 'Components/Autocomplete',
};

export default meta;

type Story = StoryObj<typeof Autocomplete>;

/** Default Autocomplete */
export const Default: Story = {
  args: {
    options: fruits,
  },
  render: (args) => <Autocomplete {...args} />,
};

export const noOptionsMessage: Story = {
  args: {
    defaultValue: null,
    noOptionsMessage:
      'This is a custom message when there are no options to display.',
    options: [],
    placeholder: 'Select a Fruit',
  },
  render: (args) => <Autocomplete {...args} />,
};

/* Autocomplete Multi-select */
export const MultiSelect: Story = {
  args: {
    defaultValue: [fruits[0]],
    multiple: true,
    onSelectionChange: (selected) => {
      action('onSelectionChange')(selected.map((options) => options.value));
    },
  },
  render: (args) => <Autocomplete {...args} />,
};
