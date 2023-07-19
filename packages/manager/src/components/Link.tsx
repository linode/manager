import { sanitizeUrl } from '@braintree/sanitize-url';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { ExternalLink } from 'src/components/ExternalLink/ExternalLink';
import { useStyles } from 'src/components/Link.styles';

import type { LinkProps as _LinkProps } from 'react-router-dom';
import type { ExternalLinkProps } from 'src/components/ExternalLink/ExternalLink';

export interface LinkProps extends _LinkProps, ExternalLinkProps {
  /**
   * This property can override the value of the copy passed by default to the aria label from the children.
   * This is useful when the text of the link is unavailable, not descriptive enough, or a single icon is used as the child.
   */
  accessibleAriaLabel?: string;
  /**
   * Optional prop to render the link as an external link, which features an external link icon, opens in a new tab<br />
   * and provides by default "noopener noreferrer" attributes to prevent security vulnerabilities.
   * It is recommended to use this prop when the link is to a different domain or subdomain.
   * @default false
   */
  external?: boolean;
  children: React.ReactNode;
  forceCopyColor?: boolean;
}

const opensInNewTab = (href: string) => {
  return href.match(/http/) || href.match(/mailto/);
};

/**
 * A wrapper around React Router's `Link` <a target="_blank" href="https://reactrouter.com/en/main/components/link">component</a> that will open external links in a new window when a non-relative URL is provided.<br />
 * <br />
 *
 * **Link Usage**
 * - Links are to be used for navigating to another page, or where appropriate, for downloading a file (indicate what the file type is via text or an icon). They are not to be used for performing in-page actions like a button.
 * - Links can have an icon preceding the text, which should be sized appropriately relative to the font size.
 * - Links can be used inline, mid sentence. But, it is preferred that they be at the end of a sentence or a separate text element.
 * - Links should never be just an icon. There should always be text or accessibility support.<br />
 *
 * **External Link Usage**
 * - External links are to be used for navigating to a page in a domain other than linode.com or akamai.com.
 * - External links should have an external link icon following the text, which should be sized appropriately relative to the font size.
 * - External links should not be used inline, mid sentence. They should either be at the end of a sentence or a separate text element.
 * - External links provide by default "noopener noreferrer" attributes to prevent security vulnerabilities.
 * - ExternalLink component provides by default "aria-label" attributes to improve accessibility.
 */
export const Link = (props: LinkProps) => {
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
            [classes.forceCopyColor]: forceCopyColor,
          },
          className
        )}
        aria-label={ariaLabel}
        data-testid="external-link"
        href={sanitizedUrl()}
        onClick={onClick}
        rel="noopener noreferrer"
        target="_blank"
      >
        {children}
      </a>
    ) : (
      <RouterLink
        {...props}
        data-testid="internal-link"
        className={cx(
          classes.root,
          {
            [classes.forceCopyColor]: forceCopyColor,
          },
          className
        )}
      />
    );
  }
};
