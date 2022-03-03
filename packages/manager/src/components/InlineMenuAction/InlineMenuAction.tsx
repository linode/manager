/* eslint-disable react/jsx-no-useless-fragment */
import * as React from 'react';
import { Link } from 'react-router-dom';
import Button from 'src/components/Button/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';

const useStyles = makeStyles((theme: Theme) => ({
  btnRoot: {
    ...theme.applyLinkStyles,
    padding: '12px 10px',
    minWidth: 0,
    color: theme.textColors.linkActiveLight,
    whiteSpace: 'nowrap',
    borderRadius: 0,
    '&:hover, &:focus': {
      backgroundColor: '#3683dc',
      color: '#ffffff',
      textDecoration: 'none',
    },
    '&[disabled]': {
      // Override disabled background color defined for dark mode
      backgroundColor: 'transparent',
      color: '#cdd0d5',
      cursor: 'default',
      '&:hover': {
        backgroundColor: 'inherit',
        textDecoration: 'none',
      },
    },
  },
  linkRoot: {
    textAlign: 'center',
    color: theme.textColors.linkActiveLight,
    borderRadius: 0,
    '&:hover, &:focus': {
      backgroundColor: '#3683dc',
      color: '#ffffff',
      textDecoration: 'none',
    },
  },
}));

interface Props {
  actionText: string;
  className?: string;
  href?: string;
  disabled?: boolean;
  tooltip?: string;
  loading?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}

type CombinedProps = Props;

const InlineMenuAction: React.FC<CombinedProps> = (props) => {
  const {
    actionText,
    className,
    href,
    disabled,
    tooltip,
    onClick,
    loading,
  } = props;

  const classes = useStyles();

  if (href) {
    return (
      <Link className={`${className} ${classes.linkRoot}`} to={href}>
        <span>{actionText}</span>
      </Link>
    );
  } else {
    return (
      <Tooltip
        title={tooltip ?? ''}
        disableTouchListener
        enterDelay={500}
        leaveDelay={0}
      >
        <>
          <Button
            className={`${className} ${classes.btnRoot}`}
            onClick={onClick}
            disabled={disabled}
            loading={loading}
          >
            {actionText}
          </Button>
        </>
      </Tooltip>
    );
  }
};

export default InlineMenuAction;
