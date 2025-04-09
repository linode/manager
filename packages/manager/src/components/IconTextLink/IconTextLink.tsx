import { Button } from '@linode/ui';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Link } from 'src/components/Link';

import type { Theme } from '@mui/material/styles';
import type { SvgIcon } from 'src/components/SvgIcon';

const useStyles = makeStyles()((theme: Theme) => ({
  active: {
    color: theme.tokens.color.Ultramarine[80],
  },
  disabled: {
    '& $icon': {
      borderColor: theme.tokens.color.Neutrals[50],
      color: theme.tokens.color.Neutrals[50],
    },
    color: theme.tokens.color.Neutrals[50],
    pointerEvents: 'none',
  },
  label: {
    whiteSpace: 'nowrap',
  },
  linkWrapper: {
    '&:hover, &:focus': {
      textDecoration: 'none',
    },
    display: 'flex',
    justifyContent: 'center',
  },
  root: {
    alignItems: 'center',
    borderRadius: theme.tokens.alias.Radius.Default,
    display: 'flex',
    gap: theme.spacing(2),
    padding: theme.spacing(0.5),
  },
}));

export interface Props {
  SideIcon: React.ComponentClass | typeof SvgIcon;
  active?: boolean;
  children?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  text: string;
  title: string;
  to?: string;
}

export const IconTextLink = (props: Props) => {
  const { classes, cx } = useStyles();
  const { SideIcon, active, className, disabled, onClick, text, title, to } =
    props;

  const LinkButton = (
    <Button
      className={cx(
        classes.root,
        {
          [classes.active]: active,
          [classes.disabled]: disabled,
        },
        className
      )}
      data-qa-icon-text-link={title}
      disableRipple
      onClick={onClick}
      title={title}
    >
      <SideIcon />
      <span className={classes.label}>{text}</span>
    </Button>
  );

  if (to !== undefined && !disabled) {
    return (
      <Link className={classes.linkWrapper} to={to as string}>
        {LinkButton}
      </Link>
    );
  }

  return LinkButton;
};
