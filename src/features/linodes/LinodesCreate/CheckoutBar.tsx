import * as React from 'react';
import { StickyProps } from 'react-sticky';
import {
  withStyles,
  WithStyles,
  Theme,
  StyleRules,
} from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';
import Button from 'material-ui/Button';

import LinodeTheme from 'src/theme';

type ClassNames = 'root' | 'sidebarTitle' | 'price' | 'per';

const styles = (theme: Theme & Linode.Theme): StyleRules => ({
  root: {
    minHeight: '24px',
    minWidth: '24px',
  },
  sidebarTitle: {
    fontSize: '1.5rem',
    color: LinodeTheme.color.green,
  },
  price: {
    fontSize: '1.5rem',
    color: LinodeTheme.color.green,
    display: 'inline-block',
  },
  per: {
    display: 'inline-block',
  },
});

interface Props {
  onDeploy: () => void;
  label: string | null;
  imageInfo: { name: string, details: string } | undefined;
  typeInfo: { name: string, details: string, monthly: number } | undefined;
  regionName: string | undefined;
  backups: boolean;
}

type CombinedProps = Props & StickyProps & WithStyles<ClassNames>;

class CheckoutBar extends React.Component<CombinedProps> {
  formatPrice() {
    const { typeInfo, backups } = this.props;
    let totalPrice = typeInfo && typeInfo.monthly || 0;
    totalPrice += backups && 2.50 || 0;
    return `$${totalPrice.toFixed(2)}`;
  }

  render() {
    const {
      /**
       * Note:
       * This 'style' prop is what gives us the "sticky" styles. Other special
       * props are available, see https://github.com/captivationsoftware/react-sticky
       **/
      style,
      classes,
      onDeploy,
      label,
      backups,
      imageInfo,
      typeInfo,
      regionName,
    } = this.props;

    return (
      <div className={classes.root} style={style}>
        <Typography variant="title" className={classes.sidebarTitle}>
          {label || 'Linode'} Summary
        </Typography>

        {imageInfo &&
          <React.Fragment>
            <Typography variant="title">
              {imageInfo.name}
            </Typography>
            <Typography>
              {imageInfo.details}
            </Typography>
          </React.Fragment>
        }

        {regionName &&
          <React.Fragment>
            <Divider />
            <Typography variant="title">
              {regionName && regionName}
            </Typography>
          </React.Fragment>
        }

        {typeInfo &&
          <React.Fragment>
            <Divider />
            <Typography variant="title">
              {typeInfo.name}
            </Typography>
            <Typography>
              {typeInfo.details}
            </Typography>
          </React.Fragment>
        }

        {backups &&
          <React.Fragment>
            <Divider />
            <Typography variant="title">
              Backups Enabled
            </Typography>
            <Typography>
              $2.50/mo
            </Typography>
          </React.Fragment>
        }

        <Typography variant="title" className={classes.price}>
          {this.formatPrice()}
        </Typography>
        <Typography variant="title" className={classes.per}>
          /mo
        </Typography>

        <Button
          variant="raised"
          color="primary"
          onClick={onDeploy}
        >
          Deploy Linode
        </Button>

      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(CheckoutBar);
