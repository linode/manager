import { Box, CircleProgress } from '@linode/ui';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

const useStyles = makeStyles()((theme) => ({ root: theme.applyLinkStyles }));

export const LinkButton = (props: Props) => {
  const { classes } = useStyles();
  const { isLoading, ...rest } = props;

  const Button = (
    <button className={classes.root} tabIndex={0} type="button" {...rest} />
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
