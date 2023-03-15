import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import LandingHeader from './LandingHeader';
import Button from '../Button';
const meta: Meta<typeof LandingHeader> = {
  title: 'Components/LandingHeader',
  component: LandingHeader,
  argTypes: {
    breadcrumbProps: {
      control: {
        type: 'object',
      },
    },
    onButtonClick: {
      action: 'onButtonClick',
    },
    onButtonKeyPress: {
      action: 'onButtonKeyPress',
    },
    onDocsClick: {
      action: 'onDocsClick',
    },
    extraActions: {
      table: {
        disable: true,
      },
    },
  },
  args: {
    breadcrumbDataAttrs: { 'data-qa-breadcrumb': true },
    buttonDataAttrs: { 'data-qa-button': true },
    createButtonText: 'Create My Entity',
  },
};

export default meta;

type Story = StoryObj<typeof LandingHeader>;

export const Default: Story = {
  args: {
    analyticsLabel: 'My Docs Analytics',
    breadcrumbProps: {
      pathname: '/my/path/to/somewhere',
    },
    disabledCreateButton: false,
    docsLabel: 'Docs',
    docsLink:
      'https://www.linode.com/docs/products/compute/compute-instances/faqs/',
    entity: 'My Entity',
    extraActions: <Button buttonType="secondary">Import a Zone</Button>,
    loading: false,
    onButtonClick: action('onButtonClick'),
    onButtonKeyPress: action('onButtonKeyPress'),
    onDocsClick: action('onDocsClick'),
    removeCrumbX: 0,
    title: 'Landing Title',
  },
  render: (args) => <LandingHeader {...args} />,
};

export const withBreadcrumbOverrides: Story = {
  args: {
    breadcrumbProps: {
      pathname: '/my/path/to/somewhere',
      crumbOverrides: [
        {
          position: 1,
          label: 'My First Crumb',
          linkTo: '/someRoute',
          noCap: true,
        },
      ],
    },
  },
  render: (args) => <LandingHeader {...args} />,
};
