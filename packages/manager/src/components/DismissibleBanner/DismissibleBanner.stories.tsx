import { Button, List, ListItem, Typography } from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';

import { DismissibleBanner } from './DismissibleBanner';

import type { Meta, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof DismissibleBanner>;

export const Default: Story = {
  render: (args) => (
    <DismissibleBanner {...args} variant="info">
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
      forceImportantIconVerticalCenter
      preferenceKey="cluster-v1"
      variant="info"
    >
      <Typography>A new version of Kubernetes is available.</Typography>
    </DismissibleBanner>
  ),
};

/**
 * Example of a non-dismissible banner with an associated action
 */
export const CallToActionNonDismissibleBanner: Story = {
  render: () => (
    <DismissibleBanner
      actionButton={
        <Button buttonType="primary" onClick={() => null}>
          Try Beta Now
        </Button>
      }
      dismissible={false}
      forceImportantIconVerticalCenter
      preferenceKey="cluster-v1"
      variant="info"
    >
      <Typography>
        A new Beta version is now available with enhanced features.
      </Typography>
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

export const InfoWithLongTextAndMarkup: StoryObj = {
  render: () => (
    <DismissibleBanner
      preferenceKey="lenghty-dismissible-banner"
      variant="info"
    >
      <Typography variant="h2">
        This is a dismissible informational notice with a title.
      </Typography>
      <Typography>This notice contains long text that should wrap.</Typography>
    </DismissibleBanner>
  ),
};

export const WarningWithListTag: StoryObj = {
  render: () => (
    <DismissibleBanner
      preferenceKey="warning-list-dismissible-banner"
      variant="warning"
    >
      <ul>
        <li>This is a dismissible warning with unordered list bullets</li>
        <li>This is a dismissible warning with unordered list bullets</li>
      </ul>
    </DismissibleBanner>
  ),
};

export const WarningWithListItem: StoryObj = {
  render: () => (
    <DismissibleBanner
      preferenceKey="warning-list-item-dismissible-banner"
      variant="warning"
    >
      <List>
        <ListItem>This is a dismissible warning with list items</ListItem>
        <ListItem>This is a dismissible warning with list items</ListItem>
      </List>
    </DismissibleBanner>
  ),
};

const meta: Meta<typeof DismissibleBanner> = {
  args: { preferenceKey: 'dismissible-banner' },
  component: DismissibleBanner,
  title: 'Components/Notifications/Dismissible Banners',
};

export default meta;
