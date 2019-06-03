import Cached from '@material-ui/icons/Cached';
import * as React from 'react';
import { WithStyles } from '@material-ui/core/styles';
import {
  createStyles,
  Theme,
  withStyles
} from 'src/components/core/styles';

export interface Props {
  status: 'loading' | 'active' | 'inactive' | 'error';
}

type CSSClasses = 'loading' | 'active' | 'inactive' | 'error';

const defaultStyles = {
  fontSize: '1.5rem',
  'user-select': 'none'
};

const styles = (theme: Theme) =>
  createStyles({
  '@keyframes rotate': {
    from: {
      transform: 'rotate(0deg)'
    },
    to: {
      transform: 'rotate(360deg)'
    }
  },
  loading: {
    fontSize: '1.0rem',
    position: 'relative',
    top: 1,
    left: -1,
    '& svg': {
      animation: 'rotate 2s linear infinite',
      fill: theme.color.offBlack
    }
  },
  active: {
    color: '#01b159',
    ...defaultStyles
  },
  error: {
    color: '#d01e1e',
    ...defaultStyles
  },
  inactive: {
    color: '#efefef',
    ...defaultStyles
  }
});

const StatusIndicator = (props: Props & WithStyles<CSSClasses>) => {
  const { classes, status } = props;
  return (
    <span className={`${classes[status]}`} data-qa-status={status}>
      {status === 'loading' ? <Cached /> : <span>&#x25CF;</span>}
    </span>
  );
};

const styled = withStyles(styles);

export default styled(StatusIndicator);
