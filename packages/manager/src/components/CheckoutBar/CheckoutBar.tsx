import * as React from 'react';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import DisplayPrice from 'src/components/DisplayPrice';
import useStyles from './styles';

interface Props {
  onDeploy: () => void;
  heading: string;
  calculatedPrice?: number;
  disabled?: boolean;
  isMakingRequest?: boolean;
  priceHelperText?: string;
  submitText?: string;
  children?: JSX.Element;
  footer?: JSX.Element;
}

type CombinedProps = Props;

const CheckoutBar: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    onDeploy,
    heading,
    calculatedPrice,
    disabled,
    isMakingRequest,
    priceHelperText,
    submitText,
    footer,
  } = props;

  const price = calculatedPrice ?? 0;

  return (
    <div className={classes.root}>
      <Typography
        variant="h2"
        className={classes.sidebarTitle}
        data-qa-order-summary
      >
        {heading}
      </Typography>
      {props.children}
      {
        <div className={classes.checkoutSection} data-qa-total-price>
          <DisplayPrice price={price} interval="mo" />
          {priceHelperText && price > 0 && (
            <Typography className={classes.price}>{priceHelperText}</Typography>
          )}
        </div>
      }

      <div className={classes.checkoutSection}>
        <Button
          buttonType="primary"
          className={classes.createButton}
          disabled={disabled}
          onClick={onDeploy}
          data-qa-deploy-linode
          loading={isMakingRequest}
        >
          {submitText ?? 'Create'}
        </Button>
      </div>
      {footer ? footer : null}
    </div>
  );
};

export default CheckoutBar;
