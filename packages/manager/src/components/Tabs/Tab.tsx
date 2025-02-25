import { Tab as ReachTab } from '@reach/tabs';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import type { Theme } from '@mui/material/styles';
import type { TabProps } from '@reach/tabs';

const useStyles = makeStyles()((theme: Theme) => ({
  tab: {
    '&[data-reach-tab]': {
      '&:focus': {
        backgroundColor: theme.color.grey7,
      },
      '&:hover': {
        backgroundColor: theme.color.grey7,
      },
      alignItems: 'center',
      borderBottom: '2px solid transparent',
      color: theme.textColors.linkActiveLight,
      display: 'inline-flex',
      flexShrink: 0,
      fontSize: '0.9rem',
      lineHeight: 1.3,
      marginTop: theme.spacing(0.5),
      maxWidth: 264,
      minHeight: theme.spacing(5),
      minWidth: 50,
      padding: '6px 16px',
      textDecoration: 'none',
    },
    '&[data-reach-tab][data-selected]': {
      borderBottom: `3px solid ${theme.textColors.linkActiveLight}`,
      color: theme.textColors.headlineStatic,
      font: theme.font.bold,
    },
  },
}));

interface TabPropsWithClassName extends TabProps {
  className?: string;
}

const Tab = ({ children, className, ...rest }: TabPropsWithClassName) => {
  const { classes, cx } = useStyles();

  return (
    <ReachTab className={cx(classes.tab, className)} {...rest}>
      {children}
    </ReachTab>
  );
};

export { Tab };
