import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { InputAdornment } from './InputAdornment';

const meta: Meta<typeof InputAdornment> = {
  component: InputAdornment,
  title: 'Components/TextField/InputAdornment',
};

type Story = StoryObj<typeof InputAdornment>;

export const Default: Story = {
  args: {
    children: '%',
    position: 'end',
  },
  render: (args) => <InputAdornment {...args} />,
  // I want to show this component used in context but this crashes the browser...
  // render: (args) => (
  //   <TextField
  //     InputProps={{
  //       startAdornment: <InputAdornment {...args} />,
  //     }}
  //     label={'tst'}
  //   />
  // ),
};

export default meta;
