import * as classNames from 'classnames';
import * as React from 'react';
import { StickyProps } from 'react-sticky';

import Button from '@material-ui/core/Button';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';


type ClassNames = 'root'
  | 'checkoutSection'
  | 'noBorder'
  | 'sidebarTitle'
  | 'detail'
  | 'price'
  | 'per';

  const styles: StyleRulesCallback<ClassNames> = (theme) => ({
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
      background: theme.color.white,
      padding: theme.spacing.unit * 2,
    },
  },
  checkoutSection: {
    opacity: 0,
    padding: `${theme.spacing.unit * 2}px 0`,
    borderTop: `1px solid ${theme.color.border2}`,
    animation: 'fadeIn 225ms linear forwards',
  },
  noBorder: {
    border: 0,
  },
  sidebarTitle: {
    fontSize: '1.5rem',
    color: theme.color.green,
  },
  detail: {
    fontSize: '.8rem',
    color: theme.color.headline,
    lineHeight: '1.5em',
  },
  price: {
    fontSize: '1.5rem',
    color: theme.color.green,
    display: 'inline-block',
  },
  per: {
    display: 'inline-block',
  },
});

interface Props {
  onDeploy: () => void;
  heading: string;
  calculatedPrice?: number;
  isSticky?: boolean;
  disabled?: boolean;
  displaySections?: { title: string, details?: string | number }[];
}

type CombinedProps = Props & StickyProps & WithStyles<ClassNames>;

const displayPrice = (v: number) => `$${v.toFixed(2)}`;

class CheckoutBar extends React.Component<CombinedProps> {

  static defaultProps: Partial<Props> = {
    calculatedPrice: 0,
  };

  render() {
    const {
      /**
       * Note:
       * This 'style' prop is what gives us the "sticky" styles. Other special
       * props are available, see https://github.com/captivationsoftware/react-sticky
       */
      style,
      isSticky,
      classes,
      onDeploy,
      heading,
      calculatedPrice,
      disabled,
      displaySections,
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
        <Typography role="header" variant="title" className={classes.sidebarTitle} data-qa-order-summary>
          {heading}
        </Typography>
        {
          displaySections && displaySections.map(({ title, details }, idx) => (
            <div
              key={idx}
              className={classNames({
                [classes.checkoutSection]: true,
                [classes.noBorder]: idx === 0,
              })}
            >
              {title &&
                <Typography role="header" variant="subheading" data-qa-subheading={title}>
                  {title}
                </Typography>}
              {details && <Typography className={classes.detail}>{details}</Typography>}
            </div>
          ))
        }
        {
          <div className={`${classes.checkoutSection} ${classes.noBorder}`} data-qa-total-price>
            <Typography role="header" variant="subheading" className={classes.price}>
              {displayPrice(calculatedPrice!)}
            </Typography>
            <Typography role="header" variant="subheading" className={classes.per}>
              &nbsp;/mo
            </Typography>
          </div>
        }

        <div className={`${classes.checkoutSection} ${classes.noBorder}`}>
          <Button
            variant="raised"
            color="primary"
            disabled={disabled}
            fullWidth
            onClick={onDeploy}
            data-qa-deploy-linode
          >
            {!disabled ? 'Create' : 'Creating...'}
          </Button>
        </div>

      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(CheckoutBar);
