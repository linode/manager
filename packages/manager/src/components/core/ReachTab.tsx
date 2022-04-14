import * as React from 'react';
import { Tab as ReachTab, TabProps } from '@reach/tabs';
import { makeStyles, Theme } from './styles';
import classNames from 'classnames';

const useStyles = makeStyles((theme: Theme) => ({
  tab: {
    '&[data-reach-tab]': {
      display: 'inline-flex',
      flexShrink: 0,
      alignItems: 'center',
      borderBottom: '2px solid transparent',
      color: theme.textColors.linkActiveLight,
      fontSize: '0.9rem',
      lineHeight: 1.3,
      marginTop: theme.spacing(0.5),
      maxWidth: 264,
      minHeight: theme.spacing(5),
      minWidth: 50,
      padding: '6px 16px',
      textDecoration: 'none',
      '&:focus': {
        backgroundColor: theme.color.grey7,
      },
      '&:hover': {
        backgroundColor: theme.color.grey7,
        color: theme.palette.primary.main,
      },
    },
    '&[data-reach-tab][data-selected]': {
      borderBottom: `3px solid ${theme.textColors.linkActiveLight}`,
      color: theme.textColors.headlineStatic,
      fontFamily: theme.font.bold,
    },
  },
}));

const Tab: React.FC<TabProps & { className?: string }> = ({
  children,
  className,
  ...rest
}) => {
  const classes = useStyles();

  return (
    <ReachTab className={classNames(classes.tab, className)} {...rest}>
      {children}
    </ReachTab>
  );
};

export default Tab;
