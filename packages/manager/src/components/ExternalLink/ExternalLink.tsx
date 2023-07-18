import { sanitizeUrl } from '@braintree/sanitize-url';
import * as React from 'react';

import ExternalLinkIcon from 'src/assets/icons/external-link.svg';
import { useStyles } from 'src/components/Link.styles';

import type { LinkProps } from 'react-router-dom';

export interface ExternalLinkProps {
  ariaLabel?: string;
  children: LinkProps['children'];
  className?: string;
  forceCopyColor?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  to: LinkProps['to'];
}

export const ExternalLink = (props: ExternalLinkProps) => {
  const { classes, cx } = useStyles();
  const { ariaLabel, children, className, forceCopyColor, onClick, to } = props;

  return (
    <a
      className={cx(
        classes.root,
        {
          [classes.copyColor]: forceCopyColor,
        },
        className
      )}
      aria-label={ariaLabel}
      data-qa-external-link
      data-testid="external-site-link"
      href={sanitizeUrl(to)}
      onClick={onClick}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
      <span
        className={cx(classes.iconContainer, {
          [classes.copyColor]: forceCopyColor,
        })}
      >
        <ExternalLinkIcon />
      </span>
    </a>
  );
};
