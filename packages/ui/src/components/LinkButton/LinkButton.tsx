import { Box, CircleProgress } from '@linode/ui';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

const useStyles = makeStyles()((theme) => ({
  root: theme.applyLinkStyles,
}));

export const LinkButton = (props: Props) => {
  const { classes, cx } = useStyles();
  const { isLoading, className, ...rest } = props;

  const Button = (
    <button className={cx(classes.root, className)} type="button" {...rest} />
  );

  if (isLoading) {
    return (
      <Box alignItems="center" display="flex">
        {Button}
        <Box marginLeft={1}>
          <CircleProgress noPadding size="xs" />
        </Box>
      </Box>
    );
  }

  return Button;
};
