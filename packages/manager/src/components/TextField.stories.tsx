import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { InputAdornment } from './InputAdornment';
import { TextField } from './TextField';

const meta: Meta<typeof TextField> = {
  component: TextField,
  title: 'Components/TextField',
};

type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  args: {
    label: 'Label',
    noMarginTop: true,
    placeholder: 'Placeholder',
  },
  render: (args) => <TextField {...args} />,
};

/**
### Overview

Error messages are an indicator of system status: they let users know that a hurdle was encountered and give solutions to fix it. Users should not have to memorize instructions in order to fix the error.

### Main Principles

- Should be easy to notice and understand.
- Should give solutions to how to fix the error.
- Users should not have to memorize instructions in order to fix the error.
- Long error messages for short text fields can extend beyond the text field.
- When the user has finished filling in a field and clicks the submit button, an indicator should appear if the field contains an error. Use red to differentiate error fields from normal ones.
 */
export const Error: Story = {
  args: {
    errorText: 'This input needs further attention!',
    label: 'Label for Error',
    noMarginTop: true,
  },
  render: (args) => <TextField {...args} />,
};

/**
### Overview

Number Text Fields are used for strictly numerical input
 */
export const Number: Story = {
  args: {
    label: 'Label for Number',
    noMarginTop: true,
    type: 'number',
  },
  render: (args) => <TextField {...args} />,
};

export const WithAdornment: Story = {
  args: {
    InputProps: {
      startAdornment: <InputAdornment position="end">$</InputAdornment>,
    },
    label: 'Label with an InputAdornment',
    noMarginTop: true,
    type: 'number',
  },
  render: (args) => <TextField {...args} />,
};

export default meta;
