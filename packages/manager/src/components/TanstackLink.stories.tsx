import React from 'react';

import { TanstackLink } from './TanstackLink';

import type { TanstackLinkProps } from './TanstackLink';
import type { Meta, StoryObj } from '@storybook/react';

export const ButtonPrimary: StoryObj<TanstackLinkProps> = {
  render: () => (
    <TanstackLink buttonType="primary" to="/">
      Home
    </TanstackLink>
  ),
};

const meta: Meta<TanstackLinkProps> = {
  parameters: {
    tanStackRouter: true,
  },
  title: 'Foundations/Tanstack Link',
};
export default meta;
