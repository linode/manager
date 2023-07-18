import { sanitizeUrl } from '@braintree/sanitize-url';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { ExternalLink } from 'src/components/ExternalLink/ExternalLink';
import { useStyles } from 'src/components/Link.styles';

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
    children,
    className,
    external,
    forceCopyColor,
    onClick,
    to,
  } = props;
  const { classes, cx } = useStyles();
  const sanitizedUrl = () => sanitizeUrl(to);
  const shouldOpenInNewTab = opensInNewTab(sanitizedUrl());
  const externalNotice = '- link opens in a new tab';
  const ariaLabel = accessibleAriaLabel
    ? `${accessibleAriaLabel} ${externalNotice}`
    : `${children} ${externalNotice}`;

  if (external) {
    return (
      <ExternalLink
        ariaLabel={ariaLabel}
        className={className}
        forceCopyColor={forceCopyColor}
        onClick={onClick}
        to={to}
      >
        {children}
      </ExternalLink>
    );
  } else {
    return shouldOpenInNewTab ? (
      <a
        className={cx(
          classes.root,
          {
            [classes.copyColor]: forceCopyColor,
          },
          className
        )}
        aria-label={ariaLabel}
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
