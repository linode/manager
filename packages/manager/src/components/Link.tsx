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
      href={props.to as string}
      target="_blank"
      aria-describedby="new-window"
      rel="noopener noreferrer"
      onClick={props.onClick}
      className={props.className}
    >
      {props.children}
    </a>
  ) : (
    <RouterLink {...props} />
  );
};
