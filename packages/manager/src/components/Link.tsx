import { sanitizeUrl } from '@braintree/sanitize-url';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { ExternalLink } from 'src/components/ExternalLink/ExternalLink';

import type { LinkProps } from 'react-router-dom';
import type { ExternalLinkProps } from 'src/components/ExternalLink/ExternalLink';

interface Props extends LinkProps {
  accessibleAriaLabel?: string;
  external?: boolean;
}

const opensInNewTab = (href: string) => {
  return href.match(/http/) || href.match(/mailto/);
};

/**
 * A wrapper around React Router's `Link` component that will open external links in a new window when a non-relative URL is provided.
 */
export const Link = (props: Props & ExternalLinkProps) => {
  const {
    accessibleAriaLabel,
    black,
    children,
    className,
    external,
    onClick,
    to,
  } = props;
  const sanitizedUrl = () => sanitizeUrl(to);
  const shouldOpenInNewTab = opensInNewTab(sanitizedUrl());
  // const isLinkText = typeof children === 'string';
  const externalNotice = '- link opens in a new tab';
  const ariaLabel = accessibleAriaLabel
    ? `${accessibleAriaLabel} ${externalNotice}`
    : `${children} ${externalNotice}`;

  if (external) {
    return (
      <ExternalLink
        ariaLabel={ariaLabel}
        black={black}
        className={className}
        onClick={onClick}
        to={to}
      >
        {children}
      </ExternalLink>
    );
  } else {
    return shouldOpenInNewTab ? (
      <a
        aria-label={ariaLabel}
        className={className}
        href={sanitizedUrl()}
        onClick={onClick}
        rel="noopener noreferrer"
        target="_blank"
      >
        {children}
      </a>
    ) : (
      <RouterLink {...props} />
    );
  }
};
