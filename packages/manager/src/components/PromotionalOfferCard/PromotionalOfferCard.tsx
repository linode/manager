import * as classnames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';
import HeavenlyBucketIcon from 'src/assets/icons/promotionalOffers/heavenly-bucket.svg';
import Button from 'src/components/core/Button';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { PromotionalOffer } from 'src/featureFlags';
import { useWindowDimensions } from 'src/hooks/useWindowDimensions';
import {
  offSiteURL,
  onSiteURL,
} from 'src/utilities/sanitize-html/sanitizeHTML';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    paddingBottom: 4,
    backgroundColor: theme.bg.main,
  },
  fullWidth: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'flex-start',
    '& svg': {
      marginRight: theme.spacing(2),
      marginBottom: theme.spacing(1) - 2,
    },
    '& p:last-child': {
      marginTop: theme.spacing(1),
    },
  },
  logo: {
    marginBottom: theme.spacing(2),
  },
  copy: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  capMaxWidth: {
    maxWidth: 400,
  },
  alignLeft: {
    alignItems: 'flex-start',
  },
  footnote: {
    marginTop: theme.spacing(1),
  },
  centerText: {
    textAlign: 'center',
  },
  buttonSection: {
    margin: theme.spacing(2),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#4FAD62',
    color: 'white',
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
    textAlign: 'center',
    '&:hover, &:focus': {
      backgroundColor: '#3f8a4e',
      color: 'white',
    },
  },
  buttonSecondary: {
    backgroundColor: 'inherit',
    color: '#4FAD62',
    border: '1px solid transparent',
    transition: theme.transitions.create(['color', 'border-color']),
    borderColor: '#4FAD62',
    '&:hover, &:focus': {
      backgroundColor: 'inherit',
      color: '#72BD81',
      borderColor: '#72BD81',
    },
  },
}));

export interface Props extends PromotionalOffer {
  fullWidth?: boolean;
  className?: string;
}

type CombinedProps = Props;

export const PromotionalOfferCard: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { fullWidth, ...promotionalOfferAttributes } = props;

  const offer = promotionalOfferOrDefaults({
    ...promotionalOfferAttributes,
  });

  const Logo = logoMap[offer.logo];

  const { width } = useWindowDimensions();

  const iconSize = width < 960 || fullWidth ? 80 : 110;

  return (
    <Paper
      className={classnames({
        [classes.root]: true,
        [classes.fullWidth]: props.fullWidth,
        // Inject the className if given as as prop.
        [props.className ?? '']: Boolean(props.className),
      })}
    >
      {Logo && (
        <Logo className={classes.logo} width={iconSize} height={iconSize} />
      )}
      <div
        className={classnames({
          [classes.copy]: true,
          [classes.alignLeft]: fullWidth,
        })}
      >
        <Typography
          variant="subtitle2"
          className={classnames({
            [classes.centerText]: !fullWidth,
            [classes.capMaxWidth]: !fullWidth,
          })}
        >
          {offer.body}
        </Typography>
        {/* Don't display buttons on full-width promotional banners. */}
        {!props.fullWidth && offer.buttons.length >= 1 && (
          <div className={classes.buttonSection}>
            {/* Only display the first two buttons. Any offer containing more
            than two buttons is a mistake. */}
            {offer.buttons.slice(0, 2).map((button) => (
              <Button
                key={button.text}
                className={classnames({
                  [classes.button]: true,
                  [classes.buttonSecondary]: button.type === 'secondary',
                })}
                {...buttonProps(button.href)}
              >
                {button.text}
              </Button>
            ))}
          </div>
        )}

        {offer.footnote && (
          <Typography
            variant="body1"
            className={classnames({
              [classes.footnote]: true,
              [classes.centerText]: !fullWidth,
              [classes.capMaxWidth]: !fullWidth,
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
  buttons: offer.buttons ?? [],
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
  'heavenly-bucket.svg': HeavenlyBucketIcon,
};

/**
 *
 * Given a URL:
 *
 * If it is a valid onsite (relative) URL, use the React Router Link component
 * so the app isn't reloaded.
 *
 * If it is a valid offsite (absolute) URL, use a regular anchor node with an
 * href and open in a new tab.
 *
 * If neither of the above conditions match, the URL is not considered safe, so
 * we don't include a link at all.
 */
const buttonProps = (url: string) => {
  let linkProps;

  if (onSiteURL.test(url)) {
    linkProps = {
      component: Link,
      to: url,
    };
  } else if (offSiteURL.test(url)) {
    linkProps = {
      href: url,
      target: '_blank',
      rel: 'noopener noreferrer',
    };
  }
  return linkProps;
};
