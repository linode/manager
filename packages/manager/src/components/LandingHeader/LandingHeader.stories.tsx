import { action } from '@storybook/addon-actions';
import React from 'react';

import { Button } from '../Button/Button';
import { LandingHeader } from './LandingHeader';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof LandingHeader> = {
  argTypes: {
    breadcrumbProps: {
      control: {
        type: 'object',
      },
    },
    extraActions: {
      table: {
        disable: true,
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
  },
  args: {
    breadcrumbDataAttrs: { 'data-qa-breadcrumb': true },
    buttonDataAttrs: { 'data-qa-button': true },
    createButtonText: 'Create My Entity',
  },
  component: LandingHeader,
  title: 'Components/LandingHeader',
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
      crumbOverrides: [
        {
          label: 'My First Crumb',
          linkTo: '/someRoute',
          noCap: true,
          position: 1,
        },
      ],
      pathname: '/my/path/to/somewhere',
    },
  },
  render: (args) => <LandingHeader {...args} />,
};
