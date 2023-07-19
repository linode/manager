import React from 'react';

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
  name: 'External Link (new tab, same domain/subdomain)',
  render: (args: LinkProps) => (
    <Link
      {...args}
      to="https://www.linode.com/docs/products/compute/compute-instances/faqs"
    >
      https://www.linode.com/docs/products/compute/compute-instances/faqs
    </Link>
  ),
};

/**
 * An instance of Link component given an absolute URL, rendering an `a` tag with `target="_blank"`.
 * This version provides an `external` prop, usually belonging to the same domain or a subdomain.<br />
 * **Example**: a link to a third party provider<br />
 * It will open in a new tab and feature an external link icon.
 */
export const ExternalSite: StoryObj<LinkProps> = {
  name: 'External Site (new tab, different domain/subdomain)',
  render: (args: LinkProps) => (
    <Link {...args} external to="https://google.com">
      https://google.com
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
    external: {},
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
    forceCopyColor: false,
    to: '/internal-link',
  },
  component: Link,
  title: 'Components/Link',
};

export default meta;
