import { Chip } from '@linode/ui';
import { action } from '@storybook/addon-actions';
import React from 'react';

import { Breadcrumb } from './Breadcrumb';

import type { Meta, StoryObj } from '@storybook/react';

const withBadgeCrumbs = [
  {
    position: 3,
    label: (
      <>
        <span>test</span>
        <span
          style={{
            display: 'inline-block',
            marginLeft: '4px',
            textDecoration: 'none',
          }}
        >
          <Chip component="span" label="beta" />
        </span>
      </>
    ),
  },
];

const noBadgeCrumbs = [
  {
    position: 3,
    label: <span>test</span>,
  },
];

const meta: Meta<typeof Breadcrumb> = {
  component: Breadcrumb,
  title: 'Foundations/Breadcrumb',
  argTypes: {
    crumbOverrides: {
      options: ['With Badge', 'No Badge'],
      mapping: {
        'With Badge': withBadgeCrumbs,
        'No Badge': noBadgeCrumbs,
      },
      control: {
        type: 'radio',
        labels: {
          'With Badge': 'Show Beta Badge',
          'No Badge': 'Hide Beta Badge',
        },
      },
      defaultValue: 'No Badge',
    },
  },
};

type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  args: {
    firstAndLastOnly: false,
    onEditHandlers: {
      editableTextTitle: 'test',
      onCancel: () => action('onCancel'),
      onEdit: async () => action('onEdit'),
    },
    pathname: '/linodes/9872893679817/test/lastcrumb',
    crumbOverrides: noBadgeCrumbs,
  },
  render: (args) => <Breadcrumb {...args} />,
};

export default meta;
