import { action } from '@storybook/addon-actions';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Chip } from '@linode/ui';

import { Breadcrumb } from './Breadcrumb';

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
          <Chip label="beta" component="span" />
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
