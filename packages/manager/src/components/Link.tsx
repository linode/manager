import { sanitizeUrl } from '@braintree/sanitize-url';
import { omitProps } from '@linode/ui';
import {
  childrenContainsNoText,
  flattenChildrenIntoAriaLabel,
  opensInNewTab,
} from '@linode/utilities'; // `link.ts` utils from @linode/utilities
// eslint-disable-next-line no-restricted-imports
import { Link as RouterLink } from '@tanstack/react-router';
import * as React from 'react';

import ExternalLinkIcon from 'src/assets/icons/external-link.svg';
import { useStyles } from 'src/components/Link.styles';

import type { LinkProps as _LinkProps } from '@tanstack/react-router';

type To = _LinkProps['to'] | (string & {});

export interface LinkProps extends Omit<_LinkProps, 'to'> {
  /**
   * This property can override the value of the copy passed by default to the aria label from the children.
   * This is useful when the text of the link is unavailable, not descriptive enough, or a single icon is used as the child.
   */
  accessibleAriaLabel?: string;
  /**
   * Optional prop to bypass URL sanitization. Use with caution.
   * @default false
   */
  bypassSanitization?: boolean;
  /**
   * Optional prop to pass a className to the link.
   */
  className?: string;
  /**
   * Optional prop to render the link as an external link, which features an external link icon, opens in a new tab<br />
   * and provides by default "noopener noreferrer" attributes to prevent security vulnerabilities.
   * It is recommended to use this prop when the link is to a different domain or subdomain.
   * @default false
   */
  external?: boolean;
  /**
   * Optional prop to force the link color to match the general copy.<br />
   * Example: footer links
   * @default false
   */
  forceCopyColor?: boolean;
  /**
   * Optional prop to forcefully hide the external icon
   * @default false
   */
  hideIcon?: boolean;
  /**
   * Optional prop to pass a onClick handler to the link.
   */
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  /**
   * Optional prop to pass a pendo id to the link.
   */
  pendoId?: string;
  /**
   * Optional prop to pass a sx style to the link.
   */
  style?: React.CSSProperties;
  /**
   * Optional prop to pass a title to the link.
   */
  title?: string;
  /**
   * The destination URL. Can be a relative path for internal navigation or an absolute URL for external links.
   */
  to?: To;
}

/**
 * A wrapper around React Router's `Link` <a target="_blank" href="https://reactrouter.com/en/main/components/link">component</a> that will open external links (rendering `a` tags) in a new window when a non-relative URL is provided.<br />
 * The link can be:
 * - a relative URL, which will render a `Link` component from React Router.
 * - an absolute, same domain/subdomain URL (ex: linode.com, akamai.com) that will render an `a` tag with `target="_blank"`.
 * - an absolute URL with the `external` prop, which will render an `a` tag with `target="_blank"` and an external link icon.<br />
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
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => {
    const {
      accessibleAriaLabel,
      children,
      className,
      external,
      bypassSanitization,
      forceCopyColor,
      hideIcon,
      onClick,
      pendoId,
      style,
      title,
      to,
    } = props;
    const { classes, cx } = useStyles();
    const processedUrl = () => {
      if (!to) return '';
      return bypassSanitization ? to : sanitizeUrl(to);
    };
    const shouldOpenInNewTab = opensInNewTab(processedUrl());
    const resolvedChildren =
      typeof children === 'function'
        ? children({ isActive: false, isTransitioning: false })
        : children;
    const childrenAsAriaLabel = flattenChildrenIntoAriaLabel(resolvedChildren);
    const externalNotice = '- link opens in a new tab';
    const ariaLabel = accessibleAriaLabel
      ? `${accessibleAriaLabel} ${shouldOpenInNewTab ? externalNotice : ''}`
      : `${childrenAsAriaLabel} ${shouldOpenInNewTab ? externalNotice : ''}`;

    if (childrenContainsNoText(resolvedChildren) && !accessibleAriaLabel) {
      // eslint-disable-next-line no-console
      console.error(
        'Link component must have text content to be accessible to screen readers. Please provide an accessibleAriaLabel prop or text content.'
      );
    }

    const routerLinkProps = omitProps(props, [
      'accessibleAriaLabel',
      'external',
      'forceCopyColor',
      'to',
      'pendoId',
    ]);

    return shouldOpenInNewTab ? (
      <a
        aria-label={ariaLabel}
        className={cx(
          classes.root,
          {
            [classes.forceCopyColor]: forceCopyColor,
          },
          className
        )}
        data-pendo-id={pendoId}
        data-testid={external ? 'external-site-link' : 'external-link'}
        href={processedUrl()}
        onClick={onClick}
        ref={ref}
        rel="noopener noreferrer"
        style={style}
        target="_blank"
        title={title}
      >
        {resolvedChildren}
        {external && !hideIcon && (
          <span
            className={cx(classes.iconContainer, {
              [classes.forceCopyColor]: forceCopyColor,
            })}
          >
            <ExternalLinkIcon />
          </span>
        )}
      </a>
    ) : (
      <RouterLink
        aria-label={ariaLabel}
        data-pendo-id={pendoId}
        data-testid="internal-link"
        {...routerLinkProps}
        className={cx(
          classes.root,
          {
            [classes.forceCopyColor]: forceCopyColor,
          },
          className
        )}
        ref={ref}
        style={style}
        title={title}
        {...(to && !shouldOpenInNewTab ? { to: to as _LinkProps['to'] } : {})}
      />
    );
  }
);
