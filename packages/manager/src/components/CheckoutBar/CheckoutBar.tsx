import * as classNames from 'classnames';
import * as React from 'react';
import Button from 'src/components/Button';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DisplayPrice from 'src/components/DisplayPrice';

type ClassNames =
  | 'root'
  | 'checkoutSection'
  | 'noBorder'
  | 'sidebarTitle'
  | 'detail'
  | 'createButton'
  | 'price';

const styles = (theme: Theme) =>
  createStyles({
    '@keyframes fadeIn': {
      from: {
        opacity: 0
      },
      to: {
        opacity: 1
      }
    },
    root: {
      minHeight: '24px',
      minWidth: '24px',
      [theme.breakpoints.down('sm')]: {
        position: 'relative !important' as 'relative',
        left: '0 !important' as '0',
        bottom: '0 !important' as '0',
        background: theme.color.white,
        padding: theme.spacing(2)
      }
    },
    checkoutSection: {
      opacity: 0,
      padding: `${theme.spacing(2)}px 0`,
      borderTop: `1px solid ${theme.color.border2}`,
      animation: '$fadeIn 225ms linear forwards'
    },
    noBorder: {
      border: 0
    },
    sidebarTitle: {
      fontSize: '1.5rem',
      color: theme.color.green,
      wordBreak: 'break-word'
    },
    detail: {
      fontSize: '.8rem',
      color: theme.color.headline,
      lineHeight: '1.5em'
    },
    createButton: {
      [theme.breakpoints.up('lg')]: {
        width: '100%'
      }
    },
    price: {
      fontSize: '.8rem',
      color: theme.color.headline,
      lineHeight: '1.5em',
      marginTop: theme.spacing(1)
    }
  });

interface Props {
  onDeploy: () => void;
  heading: string;
  calculatedPrice?: number;
  disabled?: boolean;
  isMakingRequest?: boolean;
  displaySections?: { title: string; details?: string | number }[];
  priceHelperText?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class CheckoutBar extends React.Component<CombinedProps> {
  static defaultProps: Partial<Props> = {
    calculatedPrice: 0
  };

  render() {
    const {
      classes,
      onDeploy,
      heading,
      calculatedPrice,
      disabled,
      displaySections,
      isMakingRequest,
      priceHelperText
    } = this.props;

    const price = calculatedPrice ? calculatedPrice : 0;

    return (
      <div className={classes.root}>
        <Typography
          variant="h2"
          className={classes.sidebarTitle}
          data-qa-order-summary
        >
          {heading}
        </Typography>
        {displaySections &&
          displaySections.map(({ title, details }, idx) => (
            <div
              key={idx}
              className={classNames({
                [classes.checkoutSection]: true,
                [classes.noBorder]: idx === 0
              })}
            >
              {title && (
                <Typography variant="h3" data-qa-subheading={title}>
                  {title}
                </Typography>
              )}
              {details && (
                <Typography
                  component="span"
                  data-qa-details={details}
                  className={classes.detail}
                >
                  {details}
                </Typography>
              )}
            </div>
          ))}
        {
          <div
            className={`${classes.checkoutSection} ${classes.noBorder}`}
            data-qa-total-price
          >
            <DisplayPrice price={price} interval="mo" />
            {priceHelperText && price > 0 && (
              <Typography className={classes.price}>
                {priceHelperText}
              </Typography>
            )}
          </div>
        }

        <div className={`${classes.checkoutSection} ${classes.noBorder}`}>
          <Button
            buttonType="primary"
            className={classes.createButton}
            disabled={disabled}
            onClick={onDeploy}
            data-qa-deploy-linode
            loading={isMakingRequest}
          >
            Create
          </Button>
        </div>
      </div>
    );
  }
}

const styled = withStyles(styles);

export default styled(CheckoutBar);
