import * as React from 'react';
import classNames from 'classnames';
import RenderGuard from 'src/components/RenderGuard';
import { makeStyles, Theme } from 'src/components/core/styles';
import Box, { BoxProps } from '../core/Box';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    '& > button': {
      marginBottom: theme.spacing(1),
    },
    '& > :first-child': {
      marginRight: theme.spacing(),
      marginLeft: 0,
    },
    '& > :only-child': {
      marginRight: 0,
    },
  },
}));

const ActionPanel: React.FC<BoxProps> = (props) => {
  const classes = useStyles();
  const { className, children, ...rest } = props;

  return (
    <Box
      data-qa-buttons
      className={classNames(classes.root, className, 'actionPanel')}
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

export default RenderGuard(ActionPanel);
