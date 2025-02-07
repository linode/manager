import React from 'react';

import ComputeIcon from 'src/assets/icons/entityIcons/compute.svg';
import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from 'src/features/Linodes/LinodesLanding/LinodesLandingEmptyStateData';

import { ResourcesSection } from './ResourcesSection';

import type { Meta, StoryFn, StoryObj } from '@storybook/react';

const meta: Meta<typeof ResourcesSection> = {
  args: {
    buttonProps: [
      {
        children: 'Create Linode',
        onClick: () => {},
      },
    ],
    descriptionMaxWidth: 500,
    gettingStartedGuidesData: gettingStartedGuides,
    headers,
    icon: ComputeIcon,
    linkAnalyticsEvent,
    showTransferDisplay: true,
    wide: true,
    youtubeLinkData,
  },
  component: ResourcesSection,
  decorators: [
    (Story: StoryFn) => (
      <div style={{ margin: '1em' }}>
        <Story />
      </div>
    ),
  ],
  title: 'Features/Entity Landing Page/Placeholders/Entities',
};

export default meta;

type Story = StoryObj<typeof ResourcesSection>;

export const Linodes: Story = {
  render: (args) => <ResourcesSection {...args} />,
};
