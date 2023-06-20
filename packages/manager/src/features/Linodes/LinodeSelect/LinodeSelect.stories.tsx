import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import {
  LinodeMultiSelectProps,
  LinodeSelectV2,
  LinodeSingleSelectProps,
} from './LinodeSelectV2';

/** Default Linode Select */
export const Default: StoryObj<
  LinodeSingleSelectProps | LinodeMultiSelectProps
> = {
  render: (args: LinodeSingleSelectProps | LinodeMultiSelectProps) => (
    <LinodeSelectV2 {...args} />
  ),
};

/* Linode Multi-select */
export const MultiSelect: StoryObj<LinodeMultiSelectProps> = {
  render: (args: LinodeMultiSelectProps) => <LinodeSelectV2 {...args} />,
};

const meta: Meta<LinodeSingleSelectProps | LinodeMultiSelectProps> = {
  title: 'Components/Linode Select',
  component: LinodeSelectV2,
};
export default meta;
