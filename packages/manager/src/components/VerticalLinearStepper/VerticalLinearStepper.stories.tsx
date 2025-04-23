import { Typography } from '@linode/ui';
import React from 'react';

import { VerticalLinearStepper } from './VerticalLinearStepper';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof VerticalLinearStepper> = {
  component: VerticalLinearStepper,
  title: 'Components/VerticalLinearStepper',
};

type Story = StoryObj<typeof VerticalLinearStepper>;

export const Default: Story = {
  args: {
    steps: [
      {
        content: (
          <Typography>
            This is some test copy which acts as content for this Stepper
            component step 1.{' '}
          </Typography>
        ),
        label: 'Step1',
      },
      {
        content: (
          <Typography>
            This is some test copy which acts as content for this Stepper
            component step 2.{' '}
          </Typography>
        ),
        label: 'Step2',
      },
      {
        content: (
          <Typography>
            This is some test copy which acts as content for this Stepper
            component step 3.{' '}
          </Typography>
        ),
        label: 'Step3',
      },
    ],
  },
  render: (args) => {
    const VerticalLinearStepperExample = () => {
      return <VerticalLinearStepper {...args} />;
    };
    return <VerticalLinearStepperExample />;
  },
};

export default meta;
