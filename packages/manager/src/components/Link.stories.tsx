import React from 'react';
import Typography from 'src/components/core/Typography';
import { Link } from 'src/components/Link';
import type { LinkProps } from 'react-router-dom';
import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<LinkProps> = {
  render: (args: LinkProps) => (
    <Typography variant="body1">
      <Link
        {...args}
        to="/"
        onClick={() => alert('taking you to a relative path (in app)')}
      >
        {args.children} (internal link)
      </Link>
    </Typography>
  ),
};

export const External: StoryObj<LinkProps> = {
  render: (args: LinkProps) => (
    <Typography variant="h2">
      <Link {...args}>{args.children} (as header, external link)</Link>
    </Typography>
  ),
};

const meta: Meta<LinkProps> = {
  title: 'Components/Link',
  component: Link,
  args: {
    to: 'https://www.akamai.com',
    children: 'This is a link',
  },
  argTypes: {
    to: {
      control: {
        type: 'text',
      },
    },
    children: {
      control: {
        type: 'text',
      },
    },
  },
};

export default meta;
