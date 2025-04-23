import React from 'react';

import { TanstackLink } from './TanstackLinks';

import type { TanstackLinkComponentProps } from './TanstackLinks';
import type { Meta, StoryObj } from '@storybook/react';

export const AsButtonPrimary: StoryObj<TanstackLinkComponentProps> = {
  render: () => (
    <TanstackLink linkType="primary" to="/">
      Home
    </TanstackLink>
  ),
};

export const AsButtonSecondary: StoryObj<TanstackLinkComponentProps> = {
  render: () => (
    <TanstackLink linkType="secondary" to="/">
      Home
    </TanstackLink>
  ),
};

export const AsLink: StoryObj<TanstackLinkComponentProps> = {
  render: () => (
    <TanstackLink linkType="link" to="/">
      Home
    </TanstackLink>
  ),
};

const meta: Meta<TanstackLinkComponentProps> = {
  parameters: {
    tanStackRouter: true,
  },
  title: 'Foundations/Link/Tanstack Link',
};
export default meta;
