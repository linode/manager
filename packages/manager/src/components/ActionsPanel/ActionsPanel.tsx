import { styled, Theme } from '@mui/material/styles';
import * as React from 'react';
import RenderGuard from 'src/components/RenderGuard';
import { makeStyles } from 'tss-react/mui';
import Box, { BoxProps } from '../core/Box';

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    '& > button': {
      marginBottom: theme.spacing(1),
    },
    '& > :first-of-type': {
      marginRight: theme.spacing(),
      marginLeft: 0,
    },
    '& > :only-child': {
      marginRight: 0,
    },
  },
}));

const ActionPanel = (props: BoxProps) => {
  const { classes, cx } = useStyles();
  const { className, children, ...rest } = props;

  return (
    <Box
      data-qa-buttons
      className={cx(classes.root, className, 'actionPanel')}
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
