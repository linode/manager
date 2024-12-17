import { Button } from '@linode/ui';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

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
  icon: {
    '& .border': {
      transition: 'none',
    },
    color: 'inherit',
    fontSize: 18,
    marginRight: theme.spacing(0.5),
    transition: 'none',
  },
  label: {
    position: 'relative',
    top: -1,
    whiteSpace: 'nowrap',
  },
  left: {
    left: `-${theme.spacing(1.5)}`,
  },
  linkWrapper: {
    '&:hover, &:focus': {
      textDecoration: 'none',
    },
    display: 'flex',
    justifyContent: 'center',
  },
  root: {
    '&:focus': { outline: `1px dotted ${theme.tokens.color.Neutrals[50]}` },
    '&:hover': {
      '& .border': {
        color: theme.palette.primary.light,
      },
      backgroundColor: 'transparent',
      color: theme.palette.primary.light,
    },
    alignItems: 'flex-start',
    borderRadius: theme.tokens.borderRadius.None,
    cursor: 'pointer',
    display: 'flex',
    margin: `0 ${theme.spacing(1)} 2px 0`,
    minHeight: 'auto',
    padding: theme.spacing(1.5),
    transition: 'none',
  },
}));

export interface Props {
  SideIcon: React.ComponentClass | typeof SvgIcon;
  active?: boolean;
  children?: string;
  className?: string;
  disabled?: boolean;
  hideText?: boolean;
  left?: boolean;
  onClick?: () => void;
  text: string;
  title: string;
  to?: string;
}

export const IconTextLink = (props: Props) => {
  const { classes, cx } = useStyles();
  const {
    SideIcon,
    active,
    className,
    disabled,
    hideText,
    left,
    onClick,
    text,
    title,
    to,
  } = props;

  const LinkButton = (
    <Button
      className={cx(
        classes.root,
        {
          [classes.active]: active,
          [classes.disabled]: disabled,
          [classes.left]: left,
        },
        className
      )}
      data-qa-icon-text-link={title}
      disableRipple
      onClick={onClick}
      title={title}
    >
      <SideIcon className={cx(classes.icon, { m0: hideText })} />
      <span
        className={cx(classes.label, {
          ['visually-hidden']: hideText,
        })}
      >
        {text}
      </span>
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
