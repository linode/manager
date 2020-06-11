import * as classNames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Button from 'src/components/Button';
import ConditionalWrapper from 'src/components/ConditionalWrapper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import SvgIcon from 'src/components/core/SvgIcon';

type CSSClasses =
  | 'root'
  | 'active'
  | 'disabled'
  | 'icon'
  | 'left'
  | 'label'
  | 'linkWrapper';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'flex-start',
      cursor: 'pointer',
      padding: theme.spacing(1) + theme.spacing(1) / 2,
      color: theme.palette.primary.main,
      transition: theme.transitions.create(['color']),
      margin: `0 -${theme.spacing(1) + theme.spacing(1) / 2}px 2px 0`,
      minHeight: 'auto',
      '&:hover': {
        color: theme.palette.primary.light,
        backgroundColor: 'transparent',
        '& svg': {
          fill: theme.palette.primary.light,
          color: 'white'
        },
        '& .border': {
          color: theme.palette.primary.light
        }
      }
    },
    active: {
      color: '#1f64b6'
    },
    disabled: {
      color: '#939598',
      pointerEvents: 'none',
      '& $icon': {
        color: '#939598',
        borderColor: '#939598'
      }
    },
    icon: {
      transition: theme.transitions.create(['fill', 'color']),
      fontSize: 18,
      marginRight: theme.spacing(0.5),
      color: theme.palette.primary.main,
      '& .border': {
        transition: theme.transitions.create(['color'])
      }
    },
    left: {
      left: -(theme.spacing(1) + theme.spacing(1) / 2)
    },
    label: {
      whiteSpace: 'nowrap',
      position: 'relative',
      top: -1
    },
    linkWrapper: {
      display: 'flex',
      justifyContent: 'center'
    }
  });

export interface Props {
  SideIcon: typeof SvgIcon | React.ComponentClass;
  text: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  left?: boolean;
  className?: any;
  to?: string;
}

type FinalProps = Props & WithStyles<CSSClasses>;

const IconTextLink: React.FC<FinalProps> = props => {
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
    to
  } = props;

  return (
    <ConditionalWrapper
      condition={to !== undefined && !disabled}
      wrapper={children => (
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
            iconTextLink: true
          },
          className
        )}
        title={title}
        onClick={onClick}
        data-qa-icon-text-link={title}
      >
        <SideIcon className={classes.icon} />
        <span className={classes.label}>{text}</span>
      </Button>
    </ConditionalWrapper>
  );
};

export default withStyles(styles)(IconTextLink);
