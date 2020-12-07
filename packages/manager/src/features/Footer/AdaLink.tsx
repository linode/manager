import * as React from 'react';
import { compose } from 'recompose';
import AdaIcon from 'src/assets/icons/ada.svg';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import IconButton from 'src/components/IconButton';
import { sendAdaEvent } from 'src/utilities/ga';

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
      ada = new (window as any).AdaChaperone('linode', {
        customStyles: '#topBar > div:nth-child(2) > div { margin-right: 2.5em }'
      });
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
    <IconButton
      onClick={handleAdaInit}
      className={classes.root}
      aria-label="Get help with ADA bot"
    >
      <AdaIcon />
    </IconButton>
  ) : (
    <Tooltip title={adaError} placement="top-end" aria-label={adaError}>
      <AdaIcon className={classes.disabled} />
    </Tooltip>
  );
};

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(React.memo, styled)(AdaLink);
