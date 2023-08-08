import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

import { Button } from 'src/components/Button/Button';
import { SvgIcon } from 'src/components/SvgIcon';

const useStyles = makeStyles()((theme: Theme) => ({
  active: {
    color: '#1f64b6',
  },
  disabled: {
    '& $icon': {
      borderColor: '#939598',
      color: '#939598',
    },
    color: '#939598',
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
    '&:focus': { outline: '1px dotted #999' },
    '&:hover': {
      '& .border': {
        color: theme.palette.primary.light,
      },
      backgroundColor: 'transparent',
      color: theme.palette.primary.light,
    },
    alignItems: 'flex-start',
    borderRadius: 0,
    color: theme.textColors.linkActiveLight,
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
