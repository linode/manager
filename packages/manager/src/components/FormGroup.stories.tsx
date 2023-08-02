import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Checkbox } from './Checkbox';
import { FormControl } from './FormControl';
import { FormControlLabel } from './FormControlLabel';
import { FormGroup } from './FormGroup';

const meta: Meta<typeof FormGroup> = {
  component: FormGroup,
  title: 'Components/Form/FormGroup',
};

type Story = StoryObj<typeof FormControl>;

export const Default: Story = {
  args: {
    children: [
      <FormControlLabel control={<Checkbox />} key="1" label="Linode" />,
      <FormControlLabel control={<Checkbox />} key="2" label="Volume" />,
      <FormControlLabel control={<Checkbox />} key="3" label="Image" />,
    ],
  },
  render: (args) => <FormControl {...args} />,
};

export default meta;
