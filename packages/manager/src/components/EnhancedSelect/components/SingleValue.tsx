import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { SingleValueProps, components } from 'react-select';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme: Theme) => ({
  icon: {
    fontSize: '1.8em',
    height: 24,
    marginLeft: 6,
    marginRight: theme.spacing(),
    position: 'absolute',
    [theme.breakpoints.only('xs')]: {
      fontSize: '1.52em',
    },
  },
  root: {
    alignItems: 'center',
    display: 'flex',
    flexFlow: 'row nowrap',
    height: '100%',
    paddingLeft: `45px !important`,
  },
}));

type Props = SingleValueProps<any>;

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
