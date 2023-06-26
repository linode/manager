import React from 'react';
import { Chip } from 'src/components/core/Chip';
import type { ChipProps } from './core/Chip';
import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<ChipProps> = {
  render: (args) => <Chip {...args} />,
};

/**
 * Actionable Chips indicate a state and allow users to take action.<br />
 * **Example:** An ‘Upgrade’ chip on a Kubernetes cluster shows the software is not current and allows a user to upgrade to a new version.<br />
 * **Visual style:** solid color background.
 */
export const Clickable: StoryObj<ChipProps> = {
  render: (args) => <Chip {...args} label="Upgrade" clickable />,
};

/**
 * Static Chips are an indication of status and are intended to be informational.<br />
 * No action is required or enabled.<br />
 * **Example:** ‘NVMe’ chip on a volume.<br />
 * **Visual style:** outline.
 */
export const Outlined: StoryObj<ChipProps> = {
  render: (args) => <Chip {...args} variant="outlined" />,
};

export const Custom: StoryObj<ChipProps> = {
  render: (args) => (
    <Chip
      {...args}
      label="NVMe"
      variant="outlined"
      outlineColor="green"
      size="small"
    />
  ),
};

export const WithDeleteButton: StoryObj<ChipProps> = {
  render: (args) => {
    const ChipWrapper = () => {
      const [isDeleted, setIsDeleted] = React.useState(false);

      const handleDelete = () => {
        setIsDeleted(true);
        setTimeout(() => {
          setIsDeleted(false);
        }, 1000);
      };

      return (
        <div style={{ height: 20 }}>
          {!isDeleted ? <Chip {...args} onDelete={handleDelete} /> : null}
        </div>
      );
    };

    return <ChipWrapper />;
  },
};

const meta: Meta<ChipProps> = {
  title: 'Components/Core/Chip',
  component: Chip,
  args: { label: 'Chip', onDelete: undefined },
};
export default meta;
