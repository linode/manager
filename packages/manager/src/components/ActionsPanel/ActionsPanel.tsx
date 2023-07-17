import { Theme, styled } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import RenderGuard from 'src/components/RenderGuard';

import { Box, BoxProps } from '../Box';

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    '& > :first-of-type': {
      marginLeft: 0,
      marginRight: theme.spacing(),
    },
    '& > :only-child': {
      marginRight: 0,
    },
    '& > button': {
      marginBottom: theme.spacing(1),
    },
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(2),
  },
}));

const ActionPanel = (props: BoxProps) => {
  const { classes, cx } = useStyles();
  const { children, className, ...rest } = props;

  return (
    <Box
      className={cx(classes.root, className, 'actionPanel')}
      data-qa-buttons
      {...rest}
    >
      {Array.isArray(children)
        ? [...children].sort((child) =>
            child?.props?.buttonType === 'primary' ? 1 : -1
          ) // enforce that the primary button will always be to the right
        : children}
    </Box>
  );
};

export const StyledActionPanel = styled(ActionPanel)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: theme.spacing(2),
}));

export default RenderGuard(ActionPanel);
