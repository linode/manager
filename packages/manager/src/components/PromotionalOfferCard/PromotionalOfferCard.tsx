import * as classnames from 'classnames';
import * as React from 'react';
import HeavenlyBucketIcon from 'src/assets/icons/promotionalOffers/heavenly-bucket.svg';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { PromotionalOffer } from 'src/featureFlags';
import { useWindowDimensions } from 'src/hooks/useWindowDimensions';
import { isURLValid } from 'src/utilities/sanitize-html/sanitizeHTML';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    padding: theme.spacing(2),
    backgroundColor: theme.bg.main
  },
  fullWidth: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'flex-start',
    padding: theme.spacing(1),
    '& svg': {
      marginRight: theme.spacing(2),
      marginBottom: theme.spacing(1) - 2
    },
    '& p:last-child': {
      marginTop: theme.spacing(1)
    }
  },
  logo: {
    marginBottom: theme.spacing(2)
  },
  copy: {
    width: '100%'
  },
  footnote: {
    marginTop: theme.spacing(2)
  },
  centerText: {
    textAlign: 'center'
  },
  buttonSection: {
    margin: theme.spacing(2),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  button: {
    backgroundColor: '#4FAD62',
    color: 'white',
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
    textAlign: 'center',
    '&:hover, &:focus': {
      backgroundColor: '#3f8a4e',
      color: 'white'
    }
  }
}));

export interface Props extends PromotionalOffer {
  fullWidth?: boolean;
}

type CombinedProps = Props;

export const PromotionalOfferCard: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { fullWidth, ...promotionalOfferAttributes } = props;

  const offer = promotionalOfferOrDefaults({
    ...promotionalOfferAttributes
  });

  const Logo = logoMap[offer.logo];

  const { width } = useWindowDimensions();

  const iconSize = width < 960 || fullWidth ? 80 : 110;

  return (
    <Paper
      className={classnames({
        [classes.root]: true,
        [classes.fullWidth]: props.fullWidth
      })}
    >
      {Logo && (
        <Logo className={classes.logo} width={iconSize} height={iconSize} />
      )}
      <div className={classes.copy}>
        <Typography
          variant="subtitle2"
          className={classnames({
            [classes.centerText]: !fullWidth
          })}
        >
          {offer.body}
        </Typography>
        {/* Don't display buttons on full-width promotional banners. */}
        {!props.fullWidth && offer.buttons && (
          <div className={classes.buttonSection}>
            {/* Only display the first two buttons. Any offer containing more
            than two buttons is a mistake. */}
            {offer.buttons.slice(0, 2).map(button => (
              <Button
                key={button.text}
                className={classes.button}
                // Check URL validity first as a security measure.
                href={isURLValid(button.href) ? button.href : undefined}
              >
                {button.text}
              </Button>
            ))}
          </div>
        )}

        {offer.footnote && (
          <Typography
            variant="body2"
            className={classnames({
              [classes.footnote]: true,
              [classes.centerText]: !fullWidth
            })}
          >
            {offer.footnote}
          </Typography>
        )}
      </div>
    </Paper>
  );
};

export default PromotionalOfferCard;

// Be extra-cautious when accessing fields on promotionalOffers, since they are
// sourced from our external feature flag service. This function ensures that
// each field is the type consumers are expecting, subbing defaults if they
// aren't defined.
export const promotionalOfferOrDefaults = (
  offer: PromotionalOffer
): PromotionalOffer => ({
  name: checkStringOrDefault(offer.name),
  body: checkStringOrDefault(offer.body),
  footnote: checkStringOrDefault(offer.footnote),
  logo: checkStringOrDefault(offer.logo),
  alt: checkStringOrDefault(offer.alt),
  features: offer.features ?? ['None'],
  displayOnDashboard: offer.displayOnDashboard ?? false,
  buttons: offer.buttons ?? []
});

export const checkStringOrDefault = (maybeString: any, defaultVal?: string) => {
  if (typeof maybeString === 'string') {
    return maybeString;
  } else if (defaultVal) {
    return defaultVal;
  }
  return '';
};

export const logoMap: Record<PromotionalOffer['logo'], any> = {
  'heavenly-bucket.svg': HeavenlyBucketIcon
};
