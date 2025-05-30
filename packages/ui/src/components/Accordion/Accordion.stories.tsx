import React from 'react';

import { Accordion } from './Accordion';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * Pretend this is `react-router-dom`'s Link component.
 * This is just an example to show usage with `Accordion`
 */
const Link = (props: React.PropsWithChildren<{ to?: string }>) => {
  return (
    <a {...props} href={props.to} rel="noreferrer" target="_blank">
      {props.children}
    </a>
  );
};

const subHeadingString =
  'This is a subheading. It provides context and an explanation of what this section is about.';

const subHeadingNode = (
  <>
    {subHeadingString}{' '}
    <Link to="https://techdocs.akamai.com/home">Learn more</Link>.
  </>
);

const meta: Meta<typeof Accordion> = {
  component: Accordion,
  title: 'Foundations/Accordion',
};

type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  args: {
    children: <p>Any children can go here!</p>,
    heading: 'This is an Accordion',
  },
};

export const WithHeadingNumberCount: Story = {
  args: {
    children: <p>Any children can go here!</p>,
    heading: 'This is an Accordion',
    headingNumberCount: 1,
  },
};

export const WithSubheadingString: Story = {
  args: {
    children: <p>Any children can go here!</p>,
    heading: 'This is an Accordion',
    subHeading: subHeadingString,
  },
};

export const WithSubheadingNode: Story = {
  args: {
    children: <p>Any children can go here!</p>,
    heading: 'This is an Accordion',
    subHeading: subHeadingNode,
  },
};

export default meta;
