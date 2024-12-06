import { Paper, Typography } from '@linode/ui';
import Button from '@mui/material/Button';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

import HeavenlyBucketIcon from 'src/assets/icons/promotionalOffers/heavenly-bucket.svg';
import { OFFSITE_URL_REGEX, ONSITE_URL_REGEX } from 'src/constants';
import { useWindowDimensions } from 'src/hooks/useWindowDimensions';

import type { Theme } from '@mui/material/styles';
import type { PromotionalOffer } from 'src/featureFlags';

const useStyles = makeStyles()((theme: Theme) => ({
  alignLeft: {
    alignItems: 'flex-start',
  },
  button: {
    '&:hover, &:focus': {
      backgroundColor: theme.tokens.color.Green[70],
      color: theme.tokens.color.Neutrals.White,
    },
    backgroundColor: theme.tokens.color.Green[60],
    color: theme.tokens.color.Neutrals.White,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    textAlign: 'center',
  },
  buttonSecondary: {
    '&:hover, &:focus': {
      backgroundColor: 'inherit',
      borderColor: theme.tokens.color.Green[50],
      color: theme.tokens.color.Green[50],
    },
    backgroundColor: 'inherit',
    border: '1px solid transparent',
    borderColor: theme.tokens.color.Green[60],
    color: theme.tokens.color.Green[60],
    transition: theme.transitions.create(['color', 'border-color']),
  },
  buttonSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    margin: theme.spacing(2),
  },
  capMaxWidth: {
    maxWidth: 400,
  },
  centerText: {
    textAlign: 'center',
  },
  copy: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  footnote: {
    marginTop: theme.spacing(1),
  },
  fullWidth: {
    '& p:last-child': {
      marginTop: theme.spacing(1),
    },
    '& svg': {
      marginBottom: `calc(${theme.spacing(1)} - 2)`,
      marginRight: theme.spacing(2),
    },
    alignContent: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  logo: {
    marginBottom: theme.spacing(2),
  },
  root: {
    alignItems: 'center',
    backgroundColor: theme.bg.main,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: 4,
  },
}));

export interface PromotionalOfferCardProps extends PromotionalOffer {
  className?: string;
  fullWidth?: boolean;
}

export const PromotionalOfferCard = (props: PromotionalOfferCardProps) => {
  const { classes, cx } = useStyles();

  const { fullWidth, ...promotionalOfferAttributes } = props;

  const offer = promotionalOfferOrDefaults({
    ...promotionalOfferAttributes,
  });

  const Logo = logoMap[offer.logo];

  const { width } = useWindowDimensions();

  const iconSize = width < 960 || fullWidth ? 80 : 110;

  return (
    <Paper
      className={cx({
        [classes.fullWidth]: props.fullWidth,
        [classes.root]: true,
        // Inject the className if given as as prop.
        [props.className ?? '']: Boolean(props.className),
      })}
    >
      {Logo && (
        <Logo className={classes.logo} height={iconSize} width={iconSize} />
      )}
      <div
        className={cx({
          [classes.alignLeft]: fullWidth,
          [classes.copy]: true,
        })}
      >
        <Typography
          className={cx({
            [classes.capMaxWidth]: !fullWidth,
            [classes.centerText]: !fullWidth,
          })}
          variant="subtitle2"
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
                className={cx({
                  [classes.button]: true,
                  [classes.buttonSecondary]: button.type === 'secondary',
                })}
                key={button.text}
                {...buttonProps(button.href)}
              >
                {button.text}
              </Button>
            ))}
          </div>
        )}

        {offer.footnote && (
          <Typography
            className={cx({
              [classes.capMaxWidth]: !fullWidth,
              [classes.centerText]: !fullWidth,
              [classes.footnote]: true,
            })}
            variant="body1"
          >
            {offer.footnote}
          </Typography>
        )}
      </div>
    </Paper>
  );
};

// Be extra-cautious when accessing fields on promotionalOffers, since they are
// sourced from our external feature flag service. This function ensures that
// each field is the type consumers are expecting, subbing defaults if they
// aren't defined.
export const promotionalOfferOrDefaults = (
  offer: PromotionalOffer
): PromotionalOffer => ({
  alt: checkStringOrDefault(offer.alt),
  body: checkStringOrDefault(offer.body),
  buttons: offer.buttons ?? [],
  displayOnDashboard: offer.displayOnDashboard ?? false,
  features: offer.features ?? ['None'],
  footnote: checkStringOrDefault(offer.footnote),
  logo: checkStringOrDefault(offer.logo),
  name: checkStringOrDefault(offer.name),
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

  if (ONSITE_URL_REGEX.test(url)) {
    linkProps = {
      component: Link,
      to: url,
    };
  } else if (OFFSITE_URL_REGEX.test(url)) {
    linkProps = {
      href: url,
      rel: 'noopener noreferrer',
      target: '_blank',
    };
  }
  return linkProps;
};
