import React from 'react';

import { InputAdornment } from '../InputAdornment';
import { TextField } from './TextField';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof TextField> = {
  component: TextField,
  parameters: {
    docs: {
      description: {
        component: `
### Overview
Text fields allow users to enter text into a UI.

### Usage
- Input fields should be sized to the data being entered (ex. the entry for a street address should be wider than a zip code).
- Ensure that the field can accommodate at least one more character than the maximum number to be entered.

### Rules
- Every input must have a descriptive label of what that field is.
- Required fields should include the text "(Required)" as part of the input label.
- If most fields are required, then indicate the optional fields with the text "(Optional)" instead.
- Avoid long labels; use succinct, short and descriptive labels (a word or two) so users can quickly scan your form.
  Label text shouldn't take up multiple lines.
- Placeholder text is the text that users see before they interact with a field. It should be a useful guide to the input type and format.
  Don't make the user guess what format they should use for the field. Tell this information up front.

### Best Practices
- A single column form with input fields stacked sequentially is the easiest to understand and leads to the highest success rate. Input fields in multiple columns can be overlooked or add unnecessary visual clutter.
- Grouping related inputs (ex. mailing address) under a subhead or rule can add meaning and make the form feel more manageable.
- Avoid breaking a single form into multiple "papers" unless those sections are truly independent of each other.
- Consider sizing the input field to the data being entered (ex. the field for a street address should be wider than the field for a zip code). Balance this goal with the visual benefits of fields of the same length. A somewhat outsized input that aligns with the fields above and below it might be the best choice.

## Textfield errors

### Overview

Error messages are an indicator of system status: they let users know that a hurdle was encountered and give solutions to fix it. Users should not have to memorize instructions in order to fix the error.

### Main Principles

- Should be easy to notice and understand.
- Should give solutions to how to fix the error.
- Users should not have to memorize instructions in order to fix the error.
- Long error messages for short text fields can extend beyond the text field.
- When the user has finished filling in a field and clicks the submit button, an indicator should appear if the field contains an error. Use red to differentiate error fields from normal ones.

## Number Text Fields

### Overview

Number Text Fields are used for strictly numerical input
        `,
      },
      story: {
        inline: true,
      },
    },
  },
  title: 'Foundations/TextField',
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  args: {
    label: 'Label',
    noMarginTop: true,
    placeholder: 'Placeholder',
  },
};

export const Error: Story = {
  args: {
    errorText: 'This input needs further attention!',
    label: 'Label for Error',
    noMarginTop: true,
  },
};

export const Number: Story = {
  args: {
    label: 'Label for Number',
    noMarginTop: true,
    type: 'number',
  },
};

export const WithTooltip: Story = {
  args: {
    label: 'Label',
    labelTooltipText: 'Tooltip Text',
    noMarginTop: true,
    placeholder: 'Placeholder',
  },
};

export const WithTooltipIconLeft: Story = {
  args: {
    label: 'Label',
    labelTooltipText: 'Tooltip Text',
    noMarginTop: true,
    placeholder: 'Placeholder',
    labelTooltipIconPosition: 'left',
  },
};

export const WithTooltipSmall: Story = {
  args: {
    label: 'Label',
    labelTooltipText: 'Tooltip Text',
    noMarginTop: true,
    placeholder: 'Placeholder',
    labelTooltipIconSize: 'small',
  },
};

export const WithTooltipLarge: Story = {
  args: {
    label: 'Label',
    labelTooltipText: 'Tooltip Text',
    noMarginTop: true,
    placeholder: 'Placeholder',
    labelTooltipIconSize: 'large',
  },
};

export const WithAdornment: Story = {
  args: {
    InputProps: {
      startAdornment: <InputAdornment position="start">$</InputAdornment>,
    },
    label: 'Label with an InputAdornment',
    noMarginTop: true,
    type: 'number',
  },
};
