import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

import { DismissibleBanner } from './DismissibleBanner';

import type { Meta, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof DismissibleBanner>;

export const Default: Story = {
  render: (args) => (
    <DismissibleBanner {...args}>
      <Typography>This is an example of a dismissible banner.</Typography>
    </DismissibleBanner>
  ),
};

/**
 * Example of a dismissible banner with an associated action
 */
export const CallToActionBanner: Story = {
  render: () => (
    <DismissibleBanner
      actionButton={
        <Button buttonType="primary" onClick={() => null}>
          Upgrade Version
        </Button>
      }
      preferenceKey="cluster-v1"
      variant="info"
    >
      <Typography>A new version of Kubernetes is available.</Typography>
    </DismissibleBanner>
  ),
};

/**
 * Beta banners, along with [beta chips](/docs/elements-chips-beta-chips--default-story), provide notice to users about beta features.
 */
export const BetaBanner: Story = {
  render: () => (
    <DismissibleBanner preferenceKey="beta-banner" variant="info">
      <Typography>
        Managed Database for MySQL is available in a free, open beta period
        until May 2nd, 2022. This is a beta environment and should not be used
        to support production workloads. Review the{' '}
        <Link to="https://www.linode.com/legal-eatp">
          Early Adopter Program SLA
        </Link>
        .
      </Typography>
    </DismissibleBanner>
  ),
};

const meta: Meta<typeof DismissibleBanner> = {
  args: { preferenceKey: 'dismissible-banner' },
  component: DismissibleBanner,
  title: 'Components/Notifications/Dismissible Banners',
};

export default meta;
