import React from 'react';

import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

import type { Meta, StoryObj } from '@storybook/react';
import type { LinkProps } from 'react-router-dom';

// TODO: remove the typography component from this story once M3-6772 is handled
export const Default: StoryObj<LinkProps> = {
  render: (args: LinkProps) => (
    <Typography variant="body1">
      <Link {...args} to="/">
        {args.children} (internal link)
      </Link>
    </Typography>
  ),
};

/**
 * **@deprecated**<br />
 * This story is deprecated and will be removed in a future release.
 * Please use the `ExternalLink` component when you need to render an external link.
 */
export const External: StoryObj<LinkProps> = {
  render: (args: LinkProps) => (
    <Typography variant="h2">
      <Link {...args}>{args.children} (as header, external link)</Link>
    </Typography>
  ),
};

const meta: Meta<LinkProps> = {
  argTypes: {
    children: {
      control: {
        type: 'text',
      },
      description: 'The text or content of the link.',
      table: {
        type: {
          summary: 'ReactNode',
        },
      },
    },
    className: {
      control: {
        type: 'text',
      },
      description:
        'Optional CSS class names that are applied to the component.',
      table: {
        type: {
          summary: 'string',
        },
      },
    },
    onClick: {
      action: 'clicked',
      description: 'A function that will be called onClick.',
      table: {
        type: {
          summary: '(e: React.SyntheticEvent<HTMLElement>) => void;',
        },
      },
    },
    replace: {
      control: {
        default: false,
        type: 'boolean',
      },
      description:
        'When `true`, clicking the link will replace the current entry in the history stack instead of adding a new one.',
      table: {
        type: {
          summary: 'boolean',
        },
      },
    },
    to: {
      control: 'text',
      description:
        "The link's destination. If the value contains `http` or `mailto`, it will be considered an external link and open in a new window.",
      table: {
        type: {
          summary: 'string',
        },
      },
    },
  },
  args: {
    children: 'This is a link',
    to: 'https://www.akamai.com',
  },
  component: Link,
  title: 'Components/Link',
};

export default meta;
