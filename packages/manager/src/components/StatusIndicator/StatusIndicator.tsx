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
    alignContent: 'center',
    color: theme.color.grey6,
  },
  active: {
    color: '#0AC267',
  },
}));

const StatusIndicator: React.FC<Props> = props => {
  const { status } = props;

  const classes = useStyles();

  return (
    <span
      className={classnames({
        [classes.root]: true,
        [classes.active]: status === 'active',
      })}
    >
      <Circle />
    </span>
  );
};

export default React.memo(StatusIndicator);
