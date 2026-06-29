import { Tab as ReachTab } from '@reach/tabs';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import type { TabProps } from '@reach/tabs';

const useStyles = makeStyles<{ fontSize?: string }>()(
  (theme, { fontSize }) => ({
    tab: {
      '&[data-reach-tab]': {
        '&:focus': {
          backgroundColor: theme.color.grey7,
        },
        '&:hover': {
          backgroundColor: theme.color.grey7,
        },
        '&:disabled': {
          opacity: 1,
          color: theme.tokens.component.Tab.Disabled.Text,
          cursor: 'not-allowed',
          pointerEvents: 'none',
        },
        alignItems: 'center',
        borderBottom: '2px solid transparent',
        color: theme.textColors.linkActiveLight,
        display: 'inline-flex',
        flexShrink: 0,
        fontSize: fontSize ?? '0.9rem',
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
        fontSize: fontSize ?? undefined,
      },
    },
  })
);

interface TabPropsWithClassName extends TabProps {
  className?: string;
  fontSize?: string;
}

const Tab = ({
  children,
  className,
  fontSize,
  ...rest
}: TabPropsWithClassName) => {
  const { classes, cx } = useStyles({ fontSize });

  return (
    <ReachTab className={cx(classes.tab, className)} {...rest}>
      {children}
    </ReachTab>
  );
};

export { Tab };
