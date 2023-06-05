import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import {
  LinodeMultiSelectProps,
  LinodeSelectNew,
  LinodeSingleSelectProps,
} from './LinodeSelect.new';

/** Default Linode Select */
export const Default: StoryObj<
  LinodeSingleSelectProps | LinodeMultiSelectProps
> = {
  render: (args: LinodeSingleSelectProps | LinodeMultiSelectProps) => (
    <LinodeSelectNew {...args} />
  ),
};

/* Linode Multi-select */
export const MultiSelect: StoryObj<LinodeMultiSelectProps> = {
  render: (args: LinodeMultiSelectProps) => <LinodeSelectNew {...args} />,
};

const meta: Meta<LinodeSingleSelectProps | LinodeMultiSelectProps> = {
  title: 'Components/Linode Select',
  component: LinodeSelectNew,
};
export default meta;
