import React from 'react';
import Typography from 'src/components/core/Typography';
import { Link } from 'src/components/Link';
import type { LinkProps } from 'react-router-dom';
import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<LinkProps> = {
  render: () => (
    <Typography>
      <Link to="/">This is an internal link</Link>
    </Typography>
  ),
};

export const External: StoryObj<LinkProps> = {
  render: () => (
    <Typography>
      <Link to="maito:dev@akamai.com">This is an external link</Link>
    </Typography>
  ),
};

const meta: Meta<LinkProps> = {
  title: 'Components/Link',
  component: Link,
};

export default meta;
