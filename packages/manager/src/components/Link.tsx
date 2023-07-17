import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { ExternalLink } from 'src/components/ExternalLink/ExternalLink';

import type { LinkProps } from 'react-router-dom';
import type { ExternalLinkProps } from 'src/components/ExternalLink/ExternalLink';

interface Props extends LinkProps {
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
    absoluteIcon,
    black,
    children,
    className,
    external,
    fixedIcon,
    hideIcon,
    onClick,
    to,
  } = props;
  const doesLinkOPenInNewTab = opensInNewTab(props.to);

  if (external) {
    return (
      <ExternalLink
        absoluteIcon={absoluteIcon}
        black={black}
        className={className}
        fixedIcon={fixedIcon}
        hideIcon={hideIcon}
        onClick={onClick}
        to={to}
      >
        {children}
      </ExternalLink>
    );
  } else {
    return doesLinkOPenInNewTab ? (
      <a
        aria-describedby="new-window"
        className={className}
        href={to}
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
