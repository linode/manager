import { Checkbox, FormControlLabel } from '@linode/ui';
import React from 'react';

import { FormGroup } from './FormGroup';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof FormGroup> = {
  component: FormGroup,
  title: 'Components/Form/FormGroup',
};

type Story = StoryObj<typeof FormGroup>;

export const Default: Story = {
  args: {
    children: [
      <FormControlLabel control={<Checkbox />} key="1" label="Linode" />,
      <FormControlLabel control={<Checkbox />} key="2" label="Volume" />,
      <FormControlLabel control={<Checkbox />} key="3" label="Image" />,
    ],
  },
  render: (args) => <FormGroup {...args} />,
};

export default meta;
