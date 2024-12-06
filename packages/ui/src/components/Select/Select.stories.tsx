import React from 'react';

import { Box } from '../Box';
import { Typography } from '../Typography';
import { Select } from './Select';

import type { SelectProps } from './Select';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<SelectProps> = {
  component: Select,
  decorators: [(Story) => <Box sx={{ height: 300 }}>{Story()}</Box>],
  title: 'Components/Selects/Select',
};

type Story = StoryObj<SelectProps>;

const defaultArgs: SelectProps = {
  clearable: false,
  creatable: false,
  hideLabel: false,
  label: 'A Select with a couple options',
  options: [
    { label: 'Option 1', value: 'option-1' },
    { label: 'Option 2', value: 'option-2' },
  ],
  placeholder: 'Select an option',
  required: false,
  searchable: false,
};

export const Default: Story = {
  args: defaultArgs,
  render: (args) => <Select {...args} />,
};

export const Searchable: Story = {
  args: {
    ...defaultArgs,
    searchable: true,
  },
  render: (args) => <Select {...args} />,
};

export const Required: Story = {
  args: {
    ...defaultArgs,
    required: true,
  },
  render: (args) => <Select {...args} />,
};

export const Clearable: Story = {
  args: {
    ...defaultArgs,
    clearable: true,
  },
  render: (args) => <Select {...args} />,
};

export const Loading: Story = {
  args: {
    ...defaultArgs,
    loading: true,
  },
  render: (args) => <Select {...args} />,
};

export const WithHelperText: Story = {
  args: {
    ...defaultArgs,
    helperText: 'This is some helper text',
  },
  render: (args) => <Select {...args} />,
};

export const WithErrorText: Story = {
  args: {
    ...defaultArgs,
    errorText: 'This is some error text',
  },
  render: (args) => <Select {...args} />,
};

export const Creatable: Story = {
  args: {
    ...defaultArgs,
    creatable: true,
    label: 'A select where one can create an option',
    placeholder: 'Select or create an option',
  },
  render: (args) => {
    const Wrapper = () => {
      const [value, setValue] = React.useState(args.value);

      return (
        <>
          <Select
            {...args}
            textFieldProps={{
              onChange: (e) =>
                setValue({
                  label: e.target.value,
                  value: e.target.value.replace(' ', '-').toLowerCase(),
                }),
            }}
            onChange={(_, newValue) => setValue(newValue)}
            value={value}
          />
          <Box sx={{ mt: 2 }}>
            <Typography>
              <strong>Selected Value: </strong> {JSON.stringify(value)}
            </Typography>
          </Box>
        </>
      );
    };

    return <Wrapper />;
  },
};

export default meta;
