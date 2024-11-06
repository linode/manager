import React from 'react';

import { TanstackLink } from './TanstackLink';

import type { TanstackLinkProps } from './TanstackLink';
import type { Meta, StoryObj } from '@storybook/react';

export const AsButtonPrimary: StoryObj<TanstackLinkProps> = {
  render: () => (
    <TanstackLink linkType="primary" to="/">
      Home
    </TanstackLink>
  ),
};

export const AsButtonSecondary: StoryObj<TanstackLinkProps> = {
  render: () => (
    <TanstackLink linkType="secondary" to="/">
      Home
    </TanstackLink>
  ),
};

export const AsLink: StoryObj<TanstackLinkProps> = {
  render: () => (
    <TanstackLink linkType="link" to="/">
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
