import * as classnames from 'classnames';
import * as React from 'react';
import Circle from 'src/assets/icons/circle.svg';
import { makeStyles, Theme } from 'src/components/core/styles';

export interface Props {
  status: 'active' | 'other';
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignContent: 'center'
  },
  active: {
    color: '#0ac267'
  },
  other: {
    color: theme.color.grey5
  }
}));

const StatusIndicator: React.FC<Props> = props => {
  const { status } = props;

  const classes = useStyles();

  return (
    <span
      className={classnames({
        [classes.root]: true,
        [classes.active]: status === 'active'
      })}
    >
      <Circle />
    </span>
  );
};

export default React.memo(StatusIndicator);
