import * as classNames from 'classnames';
import * as React from 'react';
import Button from 'src/components/Button';
import {
  StyleRulesCallback,
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
  | 'createButton';

const styles: StyleRulesCallback<ClassNames> = theme => ({
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
      position: 'relative !important',
      left: '0 !important',
      bottom: '0 !important',
      background: theme.color.white,
      padding: theme.spacing.unit * 2
    }
  },
  checkoutSection: {
    opacity: 0,
    padding: `${theme.spacing.unit * 2}px 0`,
    borderTop: `1px solid ${theme.color.border2}`,
    animation: 'fadeIn 225ms linear forwards'
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
  }
});

interface Props {
  onDeploy: () => void;
  heading: string;
  calculatedPrice?: number;
  disabled?: boolean;
  isMakingRequest?: boolean;
  displaySections?: { title: string; details?: string | number }[];
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
      isMakingRequest
    } = this.props;

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
                <Typography className={classes.detail}>{details}</Typography>
              )}
            </div>
          ))}
        {
          <div
            className={`${classes.checkoutSection} ${classes.noBorder}`}
            data-qa-total-price
          >
            <DisplayPrice
              price={calculatedPrice ? calculatedPrice : 0}
              interval="mo"
            />
          </div>
        }

        <div className={`${classes.checkoutSection} ${classes.noBorder}`}>
          <Button
            type="primary"
            className={classes.createButton}
            disabled={disabled}
            onClick={onDeploy}
            data-qa-deploy-linode
          >
            {!isMakingRequest ? 'Create' : 'Creating...'}
          </Button>
        </div>
      </div>
    );
  }
}

const styled = withStyles(styles);

export default styled(CheckoutBar);
