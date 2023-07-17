import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import type { LinkProps } from 'react-router-dom';

const isExternal = (href: string) => {
  return href.match(/http/) || href.match(/mailto/);
};

/**
 * A wrapper around React Router's `Link` component that will open external links in a new window when a non-relative URL is provided.
 */
export const Link = (props: LinkProps) => {
  const isLinkExternal = isExternal(props.to as string);

  return isLinkExternal ? (
    <a
      aria-describedby="new-window"
      className={props.className}
      href={props.to as string}
      onClick={props.onClick}
      rel="noopener noreferrer"
      target="_blank"
    >
      {props.children}
    </a>
  ) : (
    <RouterLink {...props} />
  );
};
