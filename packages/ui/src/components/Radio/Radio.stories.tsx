// @todo: modularization - Import from 'ui' package once FormControlLabel is migrated.
import { FormControlLabel } from '@mui/material';
import React, { useState } from 'react';

import { Box } from '../Box';
import { RadioGroup } from '../RadioGroup';
import { Radio } from './Radio';

import type { RadioProps } from './Radio';
import type { Meta, StoryObj } from '@storybook/react';

interface CustomArgs {
  checkedState?: 'checked' | 'unchecked';
  state?: 'active' | 'default' | 'disabled' | 'hover' | 'readonly';
}

type RadioStoryProps = RadioProps & CustomArgs;

const meta: Meta<RadioStoryProps> = {
  args: {
    checkedState: 'unchecked',
    size: 'medium',
    state: 'default',
  },
  argTypes: {
    state: {
      options: ['default', 'disabled', 'readonly', 'hover', 'active'],
      control: { type: 'radio' },
      description: 'The state to render',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"default"' },
      },
    },
    checkedState: {
      options: ['unchecked', 'checked'],
      control: { type: 'radio' },
      description: 'The checked state of the radio button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"unchecked"' },
      },
    },
    size: {
      control: {
        type: 'radio',
      },
      options: ['small', 'medium'],
      description: 'The size of the component',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"medium"' },
      },
    },
    disableRipple: {
      control: 'boolean',
      description: 'If true, the ripple effect is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    disableFocusRipple: {
      control: 'boolean',
      description: 'If true, the focus ripple effect is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    disableTouchRipple: {
      control: 'boolean',
      description: 'If true, the touch ripple effect is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    name: { table: { disable: true } },
    slots: { table: { disable: true } },
    slotProps: { table: { disable: true } },
    component: { table: { disable: true } },
    ref: { table: { disable: true } },
    defaultChecked: { table: { disable: true } },
    disabled: { table: { disable: true } },
    readOnly: { table: { disable: true } },
    checked: { table: { disable: true } },
  },
  component: Radio,
  decorators: [
    (Story: React.ComponentType) => (
      <Box sx={{ padding: 4 }}>
        <Story />
      </Box>
    ),
  ],
  title: 'Foundations/Radio',
};

type Story = StoryObj<RadioStoryProps>;

export const Default: Story = {
  render: (args) => {
    const {
      state = 'default',
      checkedState = 'unchecked',
      ...radioProps
    } = args;

    let stateProps: Partial<RadioProps> = {};
    if (state === 'disabled') {
      stateProps = { disabled: true };
    } else if (state === 'readonly') {
      stateProps = { readOnly: true };
    }

    let stateStyle = {};
    if (state === 'hover') {
      stateStyle = { backgroundColor: 'rgba(0, 0, 0, 0.04)' };
    } else if (state === 'active') {
      stateStyle = { backgroundColor: 'rgba(0, 0, 0, 0.08)' };
    }

    const isChecked = checkedState === 'checked';

    return (
      <Box sx={{ '& .MuiRadio-root': stateStyle }}>
        <Radio {...radioProps} {...stateProps} checked={isChecked} />
      </Box>
    );
  },
};

export const Unchecked: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => <Radio />,
};

export const UncheckedDisabled: Story = {
  name: 'Unchecked Disabled',
  parameters: {
    controls: { disable: true },
  },
  render: () => <Radio disabled />,
};

export const UncheckedReadOnly: Story = {
  name: 'Unchecked Read Only',
  parameters: {
    controls: { disable: true },
  },
  render: () => <Radio readOnly />,
};

export const Checked: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => <Radio checked />,
};

export const CheckedDisabled: Story = {
  name: 'Checked Disabled',
  parameters: {
    controls: { disable: true },
  },
  render: () => <Radio checked disabled />,
};

export const CheckedReadOnly: Story = {
  name: 'Checked Read Only',
  parameters: {
    controls: { disable: true },
  },
  render: () => <Radio checked readOnly />,
};

export const SmallSize: Story = {
  name: 'Small Size',
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Radio size="small" />
      <Radio checked size="small" />
    </Box>
  ),
};

const RadioGroupsDemo = (props: { size: 'medium' | 'small' }) => {
  const { size } = props;
  const [selectedValue, setSelectedValue] = useState('Option 1');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value);
  };

  return (
    <RadioGroup onChange={handleChange} value={selectedValue}>
      <FormControlLabel
        control={<Radio disabled size={size} />}
        label="Disabled"
        value="Disabled"
      />
      <FormControlLabel
        control={<Radio size={size} />}
        label="Option 1"
        value="Option 1"
      />
      <FormControlLabel
        control={<Radio size={size} />}
        label="Option 2"
        value="Option 2"
      />
    </RadioGroup>
  );
};

interface GroupsArgs {
  size: 'medium' | 'small';
}

export const Groups: StoryObj<GroupsArgs> = {
  name: 'Controlled Radio Groups',
  args: {
    size: 'medium',
  },
  argTypes: {
    size: {
      control: {
        type: 'radio',
      },
      options: ['small', 'medium'],
      description: 'The size of the component',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"medium"' },
      },
    },
  },
  render: (args) => {
    return <RadioGroupsDemo size={args.size} />;
  },
};

export const WithLabel: Story = {
  name: 'With Label',
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControlLabel control={<Radio />} label="Unchecked with label" />
      <FormControlLabel
        control={<Radio checked />}
        label="Checked with label"
      />
      <FormControlLabel
        control={<Radio disabled />}
        label="Disabled with label"
      />
      <FormControlLabel
        control={<Radio checked disabled />}
        label="Checked disabled with label"
      />
    </Box>
  ),
};

export default meta;
