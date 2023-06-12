import * as React from 'react';
import { components, SingleValueProps } from 'react-select';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    paddingLeft: `45px !important`,
    height: '100%',
  },
  icon: {
    fontSize: '1.8em',
    [theme.breakpoints.only('xs')]: {
      fontSize: '1.52em',
    },
    height: 24,
    marginLeft: 6,
    marginRight: theme.spacing(),
    position: 'absolute',
  },
}));

interface Props extends SingleValueProps<any> {}

export const _SingleValue: React.FC<Props> = (props) => {
  const { classes } = useStyles();
  return (
    <>
      <components.SingleValue
        data-qa-react-select-single-value
        {...props}
        className={classes.root}
      >
        {props.children}
      </components.SingleValue>
      <span className={`${props.data.className} ${classes.icon}`}>
        {props.data.flag}
      </span>
    </>
  );
};
