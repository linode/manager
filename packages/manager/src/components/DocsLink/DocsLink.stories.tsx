import * as React from 'react';

import { DocsLink } from './DocsLink';

import type { Meta, StoryObj } from '@storybook/react';
import type { DocsLinkProps } from 'src/components/DocsLink/DocsLink';

export const Default: StoryObj<DocsLinkProps> = {
  render: (args: DocsLinkProps) => <DocsLink {...args} />,
};

const meta: Meta<DocsLinkProps> = {
  argTypes: {},
  args: {
    href: 'https://techdocs.akamai.com/cloud-computing/docs/faqs-for-compute-instances',
    label: 'Custom Doc Link Label',
  },
  component: DocsLink,
  title: 'Foundations/Link/DocsLink',
};

export default meta;
