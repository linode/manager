import * as React from 'react';
import { compose } from 'recompose';
import Tooltip from 'src/components/core/Tooltip';
import IconButton from 'src/components/IconButton';

import { sendAdaEvent } from 'src/utilities/ga';

import AdaIcon from 'src/assets/icons/ada.svg';

import {
  createStyles,
  withStyles,
  WithStyles
} from '@material-ui/styles';

type ClassNames = 'root' | 'disabled';

const styles = (theme: Theme) =>
  createStyles({
  root: {
    width: 44,
    height: 44,
    padding: 0
  },
  disabled: {
    opacity: 0.3
  }
});

interface Props {
  closeMenu?: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

let ada: any;

const AdaLink: React.FC<CombinedProps> = props => {
  const [adaError, setAdaError] = React.useState<string>('');

  React.useEffect(() => {
    /*
     * Init Ada Chaperone chat app
     * Script is included in index.html
     */
    if ('AdaChaperone' in window) {
      ada = new (window as any).AdaChaperone('linode');
    } else {
      setAdaError(
        'There was an issue loading the support bot. Please try again later.'
      );
    }
  }, []);

  const handleAdaInit = () => {
    if (typeof ada === 'undefined') {
      return;
    }
    setAdaError('');
    sendAdaEvent();
    ada.show();
  };

  /** ada chat bot */
  const { classes } = props;

  return adaError === '' ? (
    <IconButton onClick={handleAdaInit} className={classes.root}>
      <AdaIcon />
    </IconButton>
  ) : (
    <Tooltip title={adaError} placement="top-end">
      <AdaIcon className={classes.disabled} />
    </Tooltip>
  );
};

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  React.memo,
  styled
)(AdaLink);
