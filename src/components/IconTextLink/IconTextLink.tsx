import * as React from 'react';
import * as classNames from 'classnames';

import { withStyles, StyleRulesCallback, WithStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import SvgIcon from '@material-ui/core/SvgIcon';

type CSSClasses = 'root'
| 'active'
| 'disabled'
| 'icon'
| 'left';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'flex-start',
    cursor: 'pointer',
    padding: 12,
    color: theme.palette.primary.main,
    transition: theme.transitions.create(['color']),
    margin: '0 -12px 6px 0',
    minHeight: 'auto',
    '&:hover': {
      color: theme.palette.primary.light,
      backgroundColor: 'transparent',
      '& $icon': {
        fill: theme.palette.primary.light,
        color: 'white',
      },
      '& .border': {
        color: theme.palette.primary.light,
      },
    },
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
    transition: theme.transitions.create(['fill', 'color']),
    fontSize: 18,
    marginRight: 5,
    color: theme.palette.primary.main,
    '& .border': {
      transition: theme.transitions.create(['color']),
    },
  },
  left: {
    left: -12,
  },
});

export interface Props {
  SideIcon: typeof SvgIcon | React.ComponentClass;
  text: string;
  onClick: () => void;
  active?: Boolean;
  disabled?: Boolean;
  title: string;
  left?: boolean;
  className?: any;
}

type FinalProps = Props & WithStyles<CSSClasses>;

const IconTextLink: React.StatelessComponent<FinalProps> = (props) => {
  const {
    SideIcon,
    classes,
    text,
    onClick,
    active,
    disabled,
    title,
    left,
    className,
  } = props;

  return (
    <Button
      className={
        classNames({
          [classes.root]: true,
          [classes.disabled]: disabled === true,
          [classes.active]: active === true,
          [classes.left]: left === true,
          iconTextLink: true,
        },
        className
      )
      }
      title={title}
      onClick={onClick}
      data-qa-icon-text-link={title}
    >
      <SideIcon className={classes.icon} />
      <span>
        {text}
      </span>
    </Button>
  );
};

export default withStyles(styles, { withTheme: true })(IconTextLink);
