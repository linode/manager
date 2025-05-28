import React from 'react';

import { Accordion } from './Accordion';

import type { Meta, StoryObj } from '@storybook/react';

const subHeadingString =
  'User data is a feature of the Metadata service that enables you to perform system configuration tasks (such as adding users and installing software) by providing custom instructions or scripts to cloud-init. Any user data should be added at this step and cannot be modified after the Linode has been created.';

const subHeadingNode = (
  <>
    {subHeadingString}{' '}
    <a
      href="https://techdocs.akamai.com/cloud-computing/docs/overview-of-the-metadata-service"
      target="blank"
    >
      Learn more.
    </a>
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
  render: (args) => <Accordion {...args} />,
};

export const WithHeadingNumberCount: Story = {
  args: {
    children: <p>Any children can go here!</p>,
    heading: 'This is an Accordion',
    headingNumberCount: 1,
  },
  render: (args) => <Accordion {...args} />,
};

export const WithSubheadingString: Story = {
  args: {
    children: <p>Any children can go here!</p>,
    heading: 'This is an Accordion',
    subHeading: subHeadingString,
  },
  render: (args) => <Accordion {...args} />,
};

export const WithSubheadingNode: Story = {
  args: {
    children: <p>Any children can go here!</p>,
    heading: 'This is an Accordion',
    subHeading: subHeadingNode,
  },
  render: (args) => <Accordion {...args} />,
};

export default meta;
