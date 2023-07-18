import { sanitizeUrl } from '@braintree/sanitize-url';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import type { LinkProps } from 'react-router-dom';

const useStyles = makeStyles<void, 'icon'>()((theme: Theme) => ({
  black: {
    color: theme.palette.text.primary,
  },
  icon: {
    bottom: -1,
    color: theme.palette.primary.main,
    height: 14,
    left: 4,
    position: 'relative',
    width: 14,
  },
  root: {
    alignItems: 'baseline',
    color: theme.name === 'dark' ? theme.textColors.linkActiveLight : undefined,
    display: 'inline-flex',
  },
}));

export interface ExternalLinkProps {
  ariaLabel?: string;
  black?: boolean;
  children: LinkProps['children'];
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  to: LinkProps['to'];
}

export const ExternalLink = (props: ExternalLinkProps) => {
  const { classes, cx } = useStyles();
  const { ariaLabel, black, children, className, onClick, to } = props;

  return (
    <a
      className={cx(
        classes.root,
        {
          [classes.black]: black,
        },
        className
      )}
      aria-label={ariaLabel}
      data-qa-external-link
      href={sanitizeUrl(to)}
      onClick={onClick}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
      <OpenInNew className={cx(classes.icon, { [classes.black]: black })} />
    </a>
  );
};
