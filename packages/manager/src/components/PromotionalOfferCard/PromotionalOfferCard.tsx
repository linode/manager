import * as classnames from 'classnames';
import * as React from 'react';
import HeavenlyBucketIcon from 'src/assets/icons/promotionalOffers/heavenly-bucket.svg';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { PromotionalOffer } from 'src/featureFlags';
import { useWindowDimensions } from 'src/hooks/useWindowDimensions';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    padding: theme.spacing(2)
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
  }
}));

interface Props extends PromotionalOffer {
  fullWidth?: boolean;
}

type CombinedProps = Props;

const PromotionalOfferCard: React.FC<CombinedProps> = props => {
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
      style={{ backgroundColor: offer.backgroundColor }}
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
          style={{ color: offer.bodyColor }}
          className={classnames({
            [classes.centerText]: !fullWidth
          })}
        >
          {offer.body}
        </Typography>
        {offer.footnote && (
          <Typography
            variant="body2"
            style={{ color: offer.footnoteColor }}
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
  backgroundColor: checkStringOrDefault(offer.backgroundColor, '#406E51'),
  bodyColor: checkStringOrDefault(offer.bodyColor, '#FFFFFF'),
  footnoteColor: checkStringOrDefault(offer.footnoteColor, '#93AE9E'),
  features: offer.features ?? ['None'],
  displayOnDashboard: offer.displayOnDashboard ?? false,
  displayInPrimaryNav: offer.displayInPrimaryNav ?? false
});

const checkStringOrDefault = (maybeString: any, defaultVal?: string) => {
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
