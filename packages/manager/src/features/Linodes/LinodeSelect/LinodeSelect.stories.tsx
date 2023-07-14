import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import {
  LinodeMultiSelectProps,
  LinodeSelectV2,
  LinodeSingleSelectProps,
} from './LinodeSelectV2';

/** Default Linode Select */
export const Default: StoryObj<
  LinodeMultiSelectProps | LinodeSingleSelectProps
> = {
  render: (args: LinodeMultiSelectProps | LinodeSingleSelectProps) => (
    <LinodeSelectV2 {...args} />
  ),
};

/* Linode Multi-select */
export const MultiSelect: StoryObj<LinodeMultiSelectProps> = {
  render: (args: LinodeMultiSelectProps) => <LinodeSelectV2 {...args} />,
};

const meta: Meta<LinodeMultiSelectProps | LinodeSingleSelectProps> = {
  component: LinodeSelectV2,
  title: 'Components/Linode Select',
};
export default meta;
