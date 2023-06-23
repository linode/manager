/* eslint-disable react/jsx-no-useless-fragment */
import * as React from 'react';
import { Link } from 'react-router-dom';
import Button from 'src/components/Button/Button';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

const useStyles = makeStyles((theme: Theme) => ({
  btnRoot: {
    ...theme.applyLinkStyles,
    '&:hover, &:focus': {
      backgroundColor: '#3683dc',
      color: '#ffffff',
      textDecoration: 'none',
    },
    '&[disabled]': {
      '&:hover': {
        backgroundColor: 'inherit',
        textDecoration: 'none',
      },
      // Override disabled background color defined for dark mode
      backgroundColor: 'transparent',
      color: '#cdd0d5',
      cursor: 'default',
    },
    borderRadius: 0,
    color: theme.textColors.linkActiveLight,
    minWidth: 0,
    padding: '12px 10px',
    whiteSpace: 'nowrap',
  },
  linkRoot: {
    '&:hover, &:focus': {
      backgroundColor: '#3683dc',
      color: '#ffffff',
      textDecoration: 'none',
    },
    borderRadius: 0,
    color: theme.textColors.linkActiveLight,
    textAlign: 'center',
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
  tooltipAnalyticsEvent?: () => void;
}

type CombinedProps = Props;

const InlineMenuAction: React.FC<CombinedProps> = (props) => {
  const {
    actionText,
    className,
    disabled,
    href,
    loading,
    onClick,
    tooltip,
    tooltipAnalyticsEvent,
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
      <Button
        className={`${className} ${classes.btnRoot}`}
        onClick={onClick}
        disabled={disabled}
        loading={loading}
        tooltipText={tooltip}
        tooltipAnalyticsEvent={tooltipAnalyticsEvent}
      >
        {actionText}
      </Button>
    );
  }
};

export default InlineMenuAction;
