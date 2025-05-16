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
    (Story) => (
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

export const States: Story = {
  name: 'Radio Button States',
  render: () => {
    return (
      <Box
        sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box sx={{ mb: 1, fontWeight: 'bold' }}>Default</Box>
          <Radio />
          <Box sx={{ mt: 2 }}>
            <Radio checked />
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box sx={{ mb: 1, fontWeight: 'bold' }}>Hover</Box>
          <Box
            sx={{
              '& .MuiRadio-root': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
            }}
          >
            <Radio />
          </Box>
          <Box
            sx={{
              mt: 2,
              '& .MuiRadio-root': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
            }}
          >
            <Radio checked />
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box sx={{ mb: 1, fontWeight: 'bold' }}>Active</Box>
          <Box
            sx={{
              '& .MuiRadio-root': { backgroundColor: 'rgba(0, 0, 0, 0.08)' },
            }}
          >
            <Radio />
          </Box>
          <Box
            sx={{
              mt: 2,
              '& .MuiRadio-root': { backgroundColor: 'rgba(0, 0, 0, 0.08)' },
            }}
          >
            <Radio checked />
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box sx={{ mb: 1, fontWeight: 'bold' }}>Disabled</Box>
          <Radio disabled />
          <Box sx={{ mt: 2 }}>
            <Radio checked disabled />
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box sx={{ mb: 1, fontWeight: 'bold' }}>Read Only</Box>
          <Radio readOnly />
          <Box sx={{ mt: 2 }}>
            <Radio checked readOnly />
          </Box>
        </Box>
      </Box>
    );
  },
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
      <FormControlLabel
        control={<Radio readOnly size={size} />}
        label="Read Only"
        value="Read Only"
      />
    </RadioGroup>
  );
};

export const Groups: Story = {
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
    return <RadioGroupsDemo size={args.size as 'medium' | 'small'} />;
  },
};

export const Interactive: Story = {
  name: 'Interactive Demo',
  parameters: {
    controls: { expanded: true },
  },
  args: {
    checkedState: 'unchecked',
    size: 'medium',
  },
  argTypes: {
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
  },
  render: (args) => {
    const { checkedState = 'unchecked', ...radioProps } = args;
    const isChecked = checkedState === 'checked';

    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Radio {...radioProps} checked={isChecked} />
        <Box component="span" sx={{ ml: 1 }}>
          Radio Label
        </Box>
      </Box>
    );
  },
};

export default meta;
