import { Typography } from '@linode/ui';
import React from 'react';

import { ShowMoreExpansion } from './ShowMoreExpansion';

import type { ShowMoreExpansionProps } from './ShowMoreExpansion';
import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<ShowMoreExpansionProps> = {
  render: (args) => <ShowMoreExpansion {...args} />,
};

const meta: Meta<ShowMoreExpansionProps> = {
  args: {
    children: (
      <Typography>
        Communicating with your Linode is usually done using the secure shell
        (SSH) protocol. SSH encrypts all of the data transferred between the
        client application on your computer and the Linode, including passwords
        and other sensitive information. There are SSH clients available for
        every desktop operating system.
      </Typography>
    ),
    defaultExpanded: false,
    name: 'Show More',
  },
  component: ShowMoreExpansion,
  title: 'Foundations/Accordion/ShowMoreExpansion',
};

export default meta;
