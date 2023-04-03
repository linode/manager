import classNames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Button from 'src/components/Button';
import ConditionalWrapper from 'src/components/ConditionalWrapper';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import SvgIcon from 'src/components/core/SvgIcon';

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'flex-start',
    cursor: 'pointer',
    padding: theme.spacing(1) + theme.spacing(0.5),
    color: theme.textColors.linkActiveLight,
    transition: 'none',
    margin: `0 ${theme.spacing(1)} 2px 0`,
    minHeight: 'auto',
    borderRadius: 0,
    '&:hover': {
      color: theme.palette.primary.light,
      backgroundColor: 'transparent',
      '& .border': {
        color: theme.palette.primary.light,
      },
    },
    '&:focus': { outline: '1px dotted #999' },
  },
  active: {
    color: '#1f64b6',
  },
  disabled: {
    color: '#939598',
    pointerEvents: 'none',
    '& $icon': {
      color: '#939598',
      borderColor: '#939598',
    },
  },
  icon: {
    transition: 'none',
    fontSize: 18,
    marginRight: theme.spacing(0.5),
    color: 'inherit',
    '& .border': {
      transition: 'none',
    },
  },
  left: {
    left: -(theme.spacing(1) + theme.spacing(0.5)),
  },
  label: {
    whiteSpace: 'nowrap',
    position: 'relative',
    top: -1,
  },
  linkWrapper: {
    display: 'flex',
    justifyContent: 'center',
    '&:hover, &:focus': {
      textDecoration: 'none',
    },
  },
}));

export interface Props {
  SideIcon: typeof SvgIcon | React.ComponentClass;
  text: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  left?: boolean;
  className?: string;
  to?: string;
  hideText?: boolean;
  children?: string;
}

const IconTextLink = (props: Props) => {
  const { classes } = useStyles();

  const {
    SideIcon,
    text,
    onClick,
    active,
    disabled,
    title,
    left,
    className,
    to,
    hideText,
  } = props;

  return (
    <ConditionalWrapper
      condition={to !== undefined && !disabled}
      wrapper={(children) => (
        <Link className={classes.linkWrapper} to={to as string}>
          {children}
        </Link>
      )}
    >
      <Button
        className={classNames(
          {
            [classes.root]: true,
            [classes.disabled]: disabled === true,
            [classes.active]: active === true,
            [classes.left]: left === true,
            iconTextLink: true,
          },
          className
        )}
        title={title}
        onClick={onClick}
        data-qa-icon-text-link={title}
        disableRipple
      >
        <SideIcon className={`${classes.icon} ${hideText === true && 'm0'}`} />
        <span
          className={classNames({
            [classes.label]: true,
            ['visually-hidden']: hideText,
          })}
        >
          {text}
        </span>
      </Button>
    </ConditionalWrapper>
  );
};

export default IconTextLink;
