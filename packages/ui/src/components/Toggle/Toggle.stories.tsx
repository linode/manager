import React from 'react';

import { FormControlLabel } from '../FormControlLabel';
import { Toggle } from './Toggle';

import type { ToggleProps } from './Toggle';
import type { Meta, StoryObj } from '@storybook/react-vite';

const EXAMPLE_TEXT = "This is some example text for the toggle's tooltip";

const ToggleWrapper = ({
  children,
}: {
  children: (state: {
    checked: boolean;
    onChange: (
      event: React.ChangeEvent<HTMLInputElement>,
      checked: boolean,
    ) => void;
  }) => React.ReactNode;
}) => {
  const [checked, setChecked] = React.useState(true);

  return (
    <>
      {children({
        checked,
        onChange: (_, newChecked) => setChecked(newChecked),
      })}
    </>
  );
};

export const Default: StoryObj<ToggleProps> = {
  render: (args) => (
    <ToggleWrapper>
      {({ checked, onChange }) => (
        <Toggle
          {...args}
          checked={checked}
          onChange={onChange}
          tooltipText={EXAMPLE_TEXT}
        />
      )}
    </ToggleWrapper>
  ),
};

export const Disabled: StoryObj<ToggleProps> = {
  render: (args) => (
    <ToggleWrapper>
      {({ checked, onChange }) => (
        <Toggle
          {...args}
          checked={checked}
          disabled
          onChange={onChange}
          tooltipText={EXAMPLE_TEXT}
        />
      )}
    </ToggleWrapper>
  ),
};

export const ToggleWithLabel: StoryObj<ToggleProps> = {
  render: (args) => (
    <ToggleWrapper>
      {({ checked, onChange }) => (
        <FormControlLabel
          control={<Toggle {...args} checked={checked} onChange={onChange} />}
          label={'Label'}
        />
      )}
    </ToggleWrapper>
  ),
};

export const ToggleWithSmallSize: StoryObj<ToggleProps> = {
  render: (args) => (
    <ToggleWrapper>
      {({ checked, onChange }) => (
        <Toggle
          {...args}
          checked={checked}
          onChange={onChange}
          size="small"
          tooltipText={EXAMPLE_TEXT}
        />
      )}
    </ToggleWrapper>
  ),
};

const meta: Meta<ToggleProps> = {
  args: {
    disabled: false,
  },
  component: Toggle,
  title: 'Foundations/Toggle',
};

export default meta;
