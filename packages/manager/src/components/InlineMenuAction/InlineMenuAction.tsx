import * as React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles, Theme } from 'src/components/core/styles';
import Button from 'src/components/Button/Button.tsx';

const useStyles = makeStyles((theme: Theme) => ({
  btnRoot: {
    ...theme.applyLinkStyles,
    padding: '12px 10px',
    minWidth: 0,
    color: theme.cmrTextColors.linkActiveLight,
    '&:hover': {
      backgroundColor: '#3683dc',
      color: '#ffffff'
    },
    '&[disabled]': {
      color: '#cdd0d5',
      cursor: 'default',
      '&:hover': {
        backgroundColor: 'inherit'
      }
    }
  },
  linkRoot: {
    textAlign: 'center',
    color: theme.cmrTextColors.linkActiveLight,
    '&:hover': {
      backgroundColor: '#3683dc',
      color: '#ffffff'
    }
  }
}));

interface Props {
  actionText: string;
  className?: string;
  href?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}

type CombinedProps = Props;

const InlineMenuAction: React.FC<CombinedProps> = props => {
  const { actionText, className, href, disabled, onClick, loading } = props;

  const classes = useStyles();

  if (href) {
    return (
      <Link className={`${className} ${classes.linkRoot}`} to={href}>
        <span>{actionText}</span>
      </Link>
    );
  } else {
    return (
      <Button
        className={`${className} ${classes.btnRoot}`}
        onClick={onClick}
        disabled={disabled}
        loading={loading}
      >
        {actionText}
      </Button>
    );
  }
};

export default InlineMenuAction;
