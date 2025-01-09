import { action } from '@storybook/addon-actions';
import React from 'react';

import { Button } from './Button';
import { StyledLinkButton } from './StyledLinkButton';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * Buttons allow users to take actions, and make choices, with a single tap.
 * - Buttons are aligned right with primary button to the far right and secondary buttons positioned to the left.
 * - There can be more than one secondary button.
 * - Ideally there is one primary button per page. This helps provide a visual focus to the main purpose of the page.
 * - Button labels should support the user taking their desired action by clearly stating what will happen when clicked (ex. Create Linode, Delete Firewall).
 * - There is no destructive button style. We do not take an implied position on the user’s knowledge or intention by using an alert color such as red for destructive actions.
 */

const meta: Meta<typeof Button> = {
  argTypes: {
    tooltipAnalyticsEvent: {
      action: 'Analytics Event Action',
    },
  },
  args: {
    buttonType: 'primary',
    children: 'Button',
    compactX: false,
    compactY: false,
    disabled: false,
    loading: false,
    onClick: action('onClick'),
    sx: {},
    tooltipAnalyticsEvent: action('tooltipAnalyticsEvent'),
    tooltipText: '',
  },
  component: Button,
  title: 'Foundations/Button',
};

export default meta;

type Story = StoryObj<typeof Button>;

/**
 * Default Primary Button
 *  Bold and easily visible. Represents the primary or preferred action on the page.
 */
export const Default: Story = {
  args: {},
  render: (args) => <Button {...args} />,
};

/** Secondary Button
 * The bold text is intentionally understated to pair well with a primary button, sit inside a table head or within a form.
 */
export const Secondary: Story = {
  args: {
    buttonType: 'secondary',
  },
  render: (args) => <Button {...args} />,
};

export const SecondaryWarning: Story = {
  args: {
    buttonType: 'secondary',
    color: 'error',
  },
  render: (args) => <Button {...args} />,
};

/** Outlined Button
 * This hybrid button style should be used with discretion. It is used when:
 * - A primary button is appropriate but is distracting or misleading. One example is a Delete button on an entity and we do not want to suggest deleting is the preferred action.
 * - A secondary button is appropriate but it could be missed because of its positioning on the page.
 */
export const Outlined: Story = {
  args: {
    buttonType: 'outlined',
  },
  parameters: {
    controls: {
      exclude: /.*/,
    },
  },
  render: (args) => <Button {...args} />,
};

/**
 * This is a styled component `<StyledLinkButton />` which is a button that looks like a link. Eventually this treatment will go away,
 * but the sake of the MUI migration we need to keep it around for now, and as a styled component in order to get rid of
 * spreading theme.applyLinkStyles.
 */
export const LinkButton: Story = {
  parameters: {
    controls: {
      exclude: /.*/,
    },
  },
  // _args must be present in order to disable controls
  render: (_args) => <StyledLinkButton>Button</StyledLinkButton>,
};

/**
 * Disabled Button w/ Tooltip
 */
export const DisabledTooltip: Story = {
  args: {
    disabled: true,
    tooltipText: `You don't have permission to do this.`,
  },
  render: (args) => <Button {...args} />,
};
