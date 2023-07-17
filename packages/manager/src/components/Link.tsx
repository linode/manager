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
  const { external, ...rest } = props;
  const doesLinkOPenInNewTab = opensInNewTab(props.to);

  if (external) {
    return <ExternalLink {...rest} />;
  } else {
    return doesLinkOPenInNewTab ? (
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
  }
};
