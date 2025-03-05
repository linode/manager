import * as React from 'react';

import { ErrorState } from './ErrorState';

import type { ErrorStateProps } from './ErrorState';
import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<ErrorStateProps> = {
  args: {
    compact: false,
    errorText: 'An error has occurred.',
  },
  render: (args) => {
    return <ErrorState {...args} />;
  },
};

const meta: Meta<ErrorStateProps> = {
  component: ErrorState,
  title: 'Components/Error State',
};

export default meta;
