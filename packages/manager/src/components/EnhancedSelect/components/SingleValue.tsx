import * as React from 'react';
import SingleValue, {
  SingleValueProps
} from 'react-select/lib/components/SingleValue';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    paddingLeft: `45px !important`
  },
  icon: {
    marginLeft: theme.spacing(1) - 2,
    marginRight: theme.spacing(1),
    fontSize: '1.8em',
    position: 'absolute',
    boxShadow: `0 0 5px ${theme.color.boxShadow}`
  }
}));

interface Props extends SingleValueProps<any> {}

type CombinedProps = Props;

const _SingleValue: React.StatelessComponent<CombinedProps> = props => {
  const classes = useStyles();
  return (
    <>
      <SingleValue
        data-qa-react-select-single-value
        {...props}
        className={classes.root}
      >
        {props.children}
      </SingleValue>
      <span className={`${props.data.className} ${classes.icon}`}>
        {props.data.flag && props.data.flag()}
      </span>
    </>
  );
};

export default _SingleValue;
