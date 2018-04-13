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
import { TypeInfo } from 'src/features/linodes/LinodesCreate/LinodesCreate';

type ClassNames = 'root'
| 'checkoutSection'
| 'noBorder'
| 'sidebarTitle'
| 'detail'
| 'price'
| 'per';

const styles = (theme: Theme & Linode.Theme): StyleRules => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  root: {
    minHeight: '24px',
    minWidth: '24px',
    [theme.breakpoints.down('md')]: {
      position: 'relative !important',
      left: '0 !important',
      bottom: '0 !important',
      background: '#fff',
      padding: theme.spacing.unit * 2,
    },
  },
  checkoutSection: {
    opacity: 0,
    padding: `${theme.spacing.unit * 2}px 0`,
    borderTop: `1px solid ${LinodeTheme.color.border2}`,
    animation: 'fadeIn 225ms linear forwards',
  },
  noBorder: {
    border: 0,
  },
  sidebarTitle: {
    fontSize: '1.5rem',
    color: LinodeTheme.color.green,
  },
  detail: {
    fontSize: '.8rem',
    color: LinodeTheme.color.headline,
    lineHeight: '1.5em',
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
  typeInfo: TypeInfo | undefined;
  regionName: string | undefined;
  backups: boolean;
  isSticky?: boolean;
}

type CombinedProps = Props & StickyProps & WithStyles<ClassNames>;

class CheckoutBar extends React.Component<CombinedProps> {
  formatPrice() {
    const { typeInfo, backups } = this.props;
    let totalPrice = typeInfo && typeInfo.monthly || 0;
    totalPrice += backups && typeInfo && typeInfo.backupsMonthly || 0;
    return `$${totalPrice.toFixed(2)}`;
  }

  renderBackupsPrice() {
    const { classes, typeInfo } = this.props;
    return typeInfo && typeInfo.backupsMonthly && (
      <Typography className={classes.detail}>
        {`$${typeInfo.backupsMonthly.toFixed(2)}`}/mo
      </Typography>
    );
  }

  render() {
    const {
      /**
       * Note:
       * This 'style' prop is what gives us the "sticky" styles. Other special
       * props are available, see https://github.com/captivationsoftware/react-sticky
       **/
      style,
      isSticky,
      classes,
      onDeploy,
      label,
      backups,
      imageInfo,
      typeInfo,
      regionName,
    } = this.props;

    let finalStyle;
    if (isSticky) {
      finalStyle = {
        ...style,
        paddingTop: 24,
      };
    }

    return (
      <div className={classes.root} style={finalStyle}>
        <Typography variant="title" className={classes.sidebarTitle} data-qa-order-summary>
          {label || 'Linode'} Summary
        </Typography>

        {imageInfo &&
          <React.Fragment>
            <div className={`${classes.checkoutSection} ${classes.noBorder}`} data-qa-image-summary>
              <Typography variant="subheading" data-qa-image-name={imageInfo.name}>
                {imageInfo.name}
              </Typography>
              <Typography className={classes.detail} data-qa-image-details-summary>
                {imageInfo.details}
              </Typography>
            </div>
          </React.Fragment>
        }

        {regionName &&
          <React.Fragment>
            <div className={classes.checkoutSection} data-qa-region-summary>
              <Typography variant="subheading">
                {regionName && regionName}
              </Typography>
            </div>
          </React.Fragment>
        }

        {typeInfo &&
          <React.Fragment>
            <div className={classes.checkoutSection} data-qa-type-summary>
              <Divider />
              <Typography variant="subheading">
                {typeInfo.name}
              </Typography>
              <Typography className={classes.detail}>
                {typeInfo.details}
              </Typography>
            </div>
          </React.Fragment>
        }

        {backups &&
          <React.Fragment>
            <div className={classes.checkoutSection} data-qa-backups-summary>
              <Divider />
              <Typography variant="subheading">
                Backups Enabled
              </Typography>
              {this.renderBackupsPrice()}
            </div>
          </React.Fragment>
        }

        <div className={`${classes.checkoutSection} ${classes.noBorder}`} data-qa-total-price>
          <Typography variant="subheading" className={classes.price}>
            {this.formatPrice()}
          </Typography>
          <Typography variant="subheading" className={classes.per}>
            &nbsp;/mo
          </Typography>
        </div>

        <div className={`${classes.checkoutSection} ${classes.noBorder}`}>
          <Button
            variant="raised"
            color="primary"
            fullWidth
            onClick={onDeploy}
            data-qa-deploy-linode
          >
            Deploy Linode
          </Button>
        </div>

      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(CheckoutBar);
