import * as React from 'react';
import { SingleValueProps } from 'react-select/lib/components/SingleValue';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    position: 'absolute'
  },
  icon: {
    marginRight: theme.spacing(1),
    fontSize: '1.8em'
  }
}));

interface Props extends SingleValueProps<any> {}

type CombinedProps = Props;

const _SingleValue: React.StatelessComponent<CombinedProps> = props => {
  const classes = useStyles();
  const { innerProps, ...rest } = props;
  return (
    <div
      data-qa-react-select-single-value
      className={classes.root}
      {...innerProps}
    >
      <span className={`${props.data.className} ${classes.icon}`} />
      <div {...rest}>{props.children}</div>
    </div>
  );
};

export default _SingleValue;
