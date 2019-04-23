import * as React from 'react';
import { compose } from 'recompose';
import Tooltip from 'src/components/core/Tooltip';
import IconButton from 'src/components/IconButton';

import AdaIcon from 'src/assets/icons/ada.svg';

import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/core/styles';

type ClassNames = 'root' | 'disabled';

const styles: StyleRulesCallback<ClassNames> = theme => ({
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
  });

  const handleAdaInit = () => {
    if (typeof ada === 'undefined') {
      return;
    }
    setAdaError('');
    ada.show();
  };

  /** ada chat bot */
  let ada: any;
  const { classes } = props;

  return adaError === '' ? (
    <IconButton onClick={handleAdaInit} className={classes.root}>
      <AdaIcon />
    </IconButton>
  ) : (
    <Tooltip title={adaError} placement="left">
      <AdaIcon className={classes.disabled} />
    </Tooltip>
  );
};

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  styled,
  React.memo
)(AdaLink);
