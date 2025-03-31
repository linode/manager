import { linodeFactory } from '@linode/utilities';
import { action } from '@storybook/addon-actions';
import * as React from 'react';

import { LinodeEntityDetail } from 'src/features/Linodes/LinodeEntityDetail';

import { EntityDetail } from './EntityDetail';

import type { Meta, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof EntityDetail>;

/**
 * Barebone, no frills example
 */
export const Default: Story = {
  args: {
    body: <div>this is a body</div>,
    footer: <div>this is a footer</div>,
    header: <div>this is a header</div>,
  },
  render: (args) => <EntityDetail {...args} />,
};

export const LinodeExample: Story = {
  render: () => {
    return (
      <div>
        <h2 style={{ margin: 0 }}>Linode Details: </h2>
        <LinodeEntityDetail
          handlers={{
            onOpenDeleteDialog: action('onOpenDeleteDialog'),
            onOpenMigrateDialog: action('onOpenMigrateDialog'),
            onOpenPowerDialog: action('onOpenPowerDialog'),
            onOpenRebuildDialog: action('onOpenRebuildDialog'),
            onOpenRescueDialog: action('onOpenRescueDialog'),
            onOpenResizeDialog: action('onOpenResizeDialog'),
          }}
          id={0}
          linode={linodeFactory.build()}
        />
      </div>
    );
  },
};

const meta: Meta<typeof EntityDetail> = {
  component: EntityDetail,
  title: 'Features/Entity Detail',
};

export default meta;
