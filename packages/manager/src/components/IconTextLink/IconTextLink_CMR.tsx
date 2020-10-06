import * as classNames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Button from 'src/components/Button';
import ConditionalWrapper from 'src/components/ConditionalWrapper';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.primary.main,
    borderRadius: 3,
    color: 'white',
    cursor: 'pointer',
    lineHeight: '1.25rem',
    margin: 'auto',
    minHeight: 'auto',
    padding: 5,
    transition: 'none',
    width: 200,
    '&:focus': {
      backgroundColor: theme.palette.primary.main
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
      color: 'white'
    }
  },
  active: {
    backgroundColor: theme.palette.primary.main,
    color: 'white'
  },
  disabled: {
    color: 'white',
    opacity: 0.5,
    pointerEvents: 'none'
  },
  left: {
    left: -(theme.spacing(1) + theme.spacing(1) / 2)
  },
  label: {
    position: 'relative',
    top: -1,
    whiteSpace: 'nowrap'
  },
  linkWrapper: {
    display: 'flex',
    justifyContent: 'center'
  }
}));

export interface Props {
  active?: boolean;
  className?: any;
  disabled?: boolean;
  left?: boolean;
  onClick?: () => void;
  text: string;
  title: string;
  to?: string;
}

type CombinedProps = Props;

const IconTextLink: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { active, className, disabled, left, onClick, text, title, to } = props;

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
        disableRipple
        data-qa-icon-text-link={title}
      >
        <span className={classes.label}>{text}</span>
      </Button>
    </ConditionalWrapper>
  );
};

export default IconTextLink;
