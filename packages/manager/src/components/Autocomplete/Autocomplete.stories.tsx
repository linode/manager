import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import { action } from '@storybook/addon-actions';
import React from 'react';

import { Autocomplete } from './Autocomplete';

import type {
  AutocompleteMultiSelectProps,
  AutocompleteSingleSelectProps,
} from './Autocomplete';
import type { Meta, StoryFn, StoryObj } from '@storybook/react';

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
    options: fruits,
  },
  component: Autocomplete,
  decorators: [
    (Story: StoryFn) => (
      <div style={{ margin: '2em' }}>
        <Story />
      </div>
    ),
  ],
  title: 'Components/Autocomplete',
};

export default meta;

const CustomValue = styled('span')(({ theme }) => ({
  fontFamily: theme.font.bold,
  fontSize: '1rem',
  wordBreak: 'break-word',
}));

const CustomDescription = styled('span')(() => ({
  fontSize: '0.875rem',
}));

type Story = StoryObj<typeof Autocomplete>;

export const Default: Story = {
  args: {
    defaultValue: fruits[0],
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

export const customRenderOptions: Story = {
  args: {
    label: 'Select a Linode',
    options: [
      {
        label: 'Nanode 1 GB, Debian 11, Newark, NJ',
        value: 'debian-us-east',
      },
      {
        label: 'Nanode 2 GB, Debian 11, Newark, NJ',
        value: 'debian-us-east-001',
      },
      {
        label: 'Nanode 3 GB, Debian 11, Newark, NJ',
        value: 'debian-us-east-002',
      },
    ],
    placeholder: 'Select a Linode',
    renderOption: (option) => (
      <Stack>
        <CustomValue>{option.value}</CustomValue>
        <CustomDescription>{option.label}</CustomDescription>
      </Stack>
    ),
  },
  render: (args) => <Autocomplete {...args} />,
};

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
