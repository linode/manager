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
    href: 'https://www.linode.com/docs/products/compute/compute-instances/faqs',
    label: 'Custom Doc Link Label',
  },
  component: DocsLink,
  title: 'Components/Link/DocsLink',
};

export default meta;
