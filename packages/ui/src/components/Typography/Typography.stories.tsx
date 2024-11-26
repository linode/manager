import React from 'react';

import { Typography } from './Typography';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Typography> = {
  component: Typography,
  title: 'Foundations/Typography',
};

type Story = StoryObj<typeof Typography>;

export const Default: Story = {
  args: {
    children: 'Hello World',
  },
  render: (args) => <Typography {...args} />,
};

/**
 * #### Primary heading
 * - Empty state entity landing pages.
 * - Billing and payment paper.
 * - Backup auto enrollment paper.
 */
export const H1: Story = {
  args: {
    children: 'Hello World',
    variant: 'h1',
  },
  render: (args) => <Typography {...args} />,
};

/**
 * #### Secondary heading
 * - Page-level headings and high-level typographical components, such as editable text and breadcrumbs.
 * - Section-level headings, such as drawers, some table headers and panel sections.
 */
export const H2: Story = {
  args: {
    children: 'Hello World',
    variant: 'h2',
  },
  render: (args) => <Typography {...args} />,
};

/**
 * #### Tertiary headings
 * - Sub-section headings.
 * - Titles of paper components.
 */
export const H3: Story = {
  args: {
    children: 'Hello World',
    variant: 'h3',
  },
  render: (args) => <Typography {...args} />,
};

export const Body1: Story = {
  args: {
    children: 'Hello World',
    variant: 'body1',
  },
  render: (args) => <Typography {...args} />,
};

export const Body2: Story = {
  args: {
    children: 'Hello World',
    variant: 'body2',
  },
  render: (args) => <Typography {...args} />,
};

export const Caption: Story = {
  args: {
    children: 'Hello World',
    variant: 'caption',
  },
  render: (args) => <Typography {...args} />,
};

export default meta;
