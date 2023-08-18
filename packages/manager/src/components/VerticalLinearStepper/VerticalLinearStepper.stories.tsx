import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Typography } from '../Typography';
import { VerticalLinearStepper } from './VerticalLinearStepper';

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
        label: 'Step 1',
      },
      {
        content: (
          <Typography>
            This is some test copy which acts as content for this Stepper
            component step 2.{' '}
          </Typography>
        ),
        label: 'Step 2',
      },
      {
        content: (
          <Typography>
            This is some test copy which acts as content for this Stepper
            component step 3.{' '}
          </Typography>
        ),
        label: 'Step 3',
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
