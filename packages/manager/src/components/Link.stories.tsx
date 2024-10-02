import React from 'react';

import DocsIcon from 'src/assets/icons/docs.svg';
import { Link } from 'src/components/Link';

import type { Meta, StoryObj } from '@storybook/react';
import type { LinkProps } from 'src/components/Link';

/**
 * An instance of Link component given a relative URL, rendering a React Router `Link` component.
 */
export const Default: StoryObj<LinkProps> = {
  render: (args: LinkProps) => <Link {...args}>{args.children}</Link>,
};

/**
 * An instance of Link component given an absolute URL, rendering an `a` tag with `target="_blank"`.
 * This version does not provide an `external` prop, usually meaning it belongs to the same domain or subdomain.<br />
 * **Example**: a documentation link<br />
 * It will open in a new tab since not being relative (internal).
 */
export const External: StoryObj<LinkProps> = {
  name: 'External Link',
  render: (args: LinkProps) => (
    <Link
      {...args}
      to="https://techdocs.akamai.com/cloud-computing/docs/faqs-for-compute-instances"
    >
      https://techdocs.akamai.com/cloud-computing/docs/faqs-for-compute-instances
    </Link>
  ),
};

/**
 * An instance of Link component given an absolute URL, rendering an `a` tag with `target="_blank"`.
 * This version provides an `external` prop, to be used when the site does not belong to the same domain or a subdomain.<br />
 * **Example**: a link to a third party provider<br />
 * It will open in a new tab and feature an external link icon.
 */
export const ExternalSite: StoryObj<LinkProps> = {
  args: {
    external: true,
  },
  name: 'External Site',
  render: (args: LinkProps) => (
    <Link {...args} to="https://google.com">
      See more at https://google.com
    </Link>
  ),
};

/**
 * This story features an Icon only as a child of Link component, and without having provided a custom `accessibleAriaLabel`
 * This example will generate a console error
 */
export const IconOnly: StoryObj<LinkProps> = {
  args: {
    accessibleAriaLabel: 'This is safe',
  },
  name: 'Icon Only',
  render: (args: LinkProps) => (
    <Link {...args} to="https://google.com">
      <DocsIcon />
    </Link>
  ),
};

const meta: Meta<LinkProps> = {
  argTypes: {
    children: {
      control: {
        type: 'text',
      },
      description: 'The content of the component.',
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
    children: 'An internal link',
    external: false,
    forceCopyColor: false,
    to: '/internal-link',
  },
  component: Link,
  title: 'Foundations/Link',
};

export default meta;
