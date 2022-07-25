import * as React from 'react';
import { components, SingleValueProps } from 'react-select';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    paddingLeft: `45px !important`,
    height: '100%',
  },
  icon: {
    fontSize: '1.8em',
    height: 24,
    marginLeft: 6,
    marginRight: theme.spacing(),
    position: 'absolute',
  },
}));

const _SingleValue = (props: SingleValueProps<any>) => {
  const classes = useStyles();
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
        {props.data.flag && props.data.flag()}
      </span>
    </>
  );
};

export default _SingleValue;
