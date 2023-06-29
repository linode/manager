import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Typography } from './Typography';

const meta: Meta<typeof Typography> = {
  title: 'Components/Typography',
  component: Typography,
};

type Story = StoryObj<typeof Typography>;

export const Default: Story = {
  render: (args) => <Typography {...args} />,
  args: {
    children: 'Hello World',
  },
};

/**
 * #### Primary heading
 * - Empty state entity landing pages.
 * - Billing and payment paper.
 * - Backup auto enrollment paper.
 */
export const H1: Story = {
  render: (args) => <Typography {...args} />,
  args: {
    variant: 'h1',
    children: 'Hello World',
  },
};

/**
 * #### Secondary heading
 * - Page-level headings and high-level typographical components, such as editable text and breadcrumbs.
 * - Section-level headings, such as drawers, some table headers and panel sections.
 */
export const H2: Story = {
  render: (args) => <Typography {...args} />,
  args: {
    variant: 'h2',
    children: 'Hello World',
  },
};

/**
 * #### Tertiary headings
 * - Sub-section headings.
 * - Titles of paper components.
 */
export const H3: Story = {
  render: (args) => <Typography {...args} />,
  args: {
    variant: 'h3',
    children: 'Hello World',
  },
};

export const Body1: Story = {
  render: (args) => <Typography {...args} />,
  args: {
    variant: 'body1',
    children: 'Hello World',
  },
};

export const Body2: Story = {
  render: (args) => <Typography {...args} />,
  args: {
    variant: 'body2',
    children: 'Hello World',
  },
};

export const Caption: Story = {
  render: (args) => <Typography {...args} />,
  args: {
    variant: 'caption',
    children: 'Hello World',
  },
};

export default meta;
