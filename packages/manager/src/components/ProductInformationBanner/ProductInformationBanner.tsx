import * as React from 'react';

import { ProductInformationBannerLocation } from 'src/featureFlags';
import useFlags from 'src/hooks/useFlags';
import DismissibleBanner from '../DismissibleBanner';
import HighlightedMarkdown from 'src/components/HighlightedMarkdown';
import { isAfter } from 'src/utilities/date';
import { reportException } from 'src/exceptionReporting';
import Warning from 'src/assets/icons/warning.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import classNames from 'classnames';
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: 1,
    fontSize: '1rem',
    marginBottom: theme.spacing(2),
    maxWidth: '100%',
    padding: '4px 16px',
    paddingRight: 18,
    position: 'relative',
    '& + .notice': {
      marginTop: `${theme.spacing()}px !important`,
    },
    '& $important': {
      backgroundColor: theme.bg.bgPaper,
    },
    '& $error': {
      borderLeftColor: theme.color.red,
    },
  },
  icon: {
    color: 'white',
    position: 'absolute',
    left: -25, // This value must be static regardless of theme selection
  },
  important: {
    backgroundColor: theme.bg.bgPaper,
    padding: theme.spacing(2),
    paddingRight: 18,
    '& $noticeText': {
      fontFamily: theme.font.normal,
    },
  },
  warning: {
    animation: '$fadeIn 225ms linear forwards',
    borderLeft: `5px solid ${theme.palette.status.warningDark}`,
    '&$important': {
      borderLeftWidth: 32,
    },
    '& $icon': {
      color: '#555',
    },
  },
  content: {
    // Compensate for HighlightedMarkdown component's margin.
    marginLeft: '-8px',
    width: '100%',
  },
}));

interface Props {
  bannerLocation: ProductInformationBannerLocation;
  productInformationIndicator?: boolean;
  productInformationWarning?: boolean;
}

const ProductInformationBanner: React.FC<Props> = (props) => {
  const { productInformationBanners } = useFlags();

  const classes = useStyles();

  // This component is primarily used to display marketing information, which has a green left border. We therefore have it default to true.
  const displayProductInformationIndicator =
    props.productInformationIndicator ?? true;

  /*
    In select instances, we also use this component to display warning information, e.g. provisioning of new database instances
    not being possible due to product maintenance. We have it default to false.
  */
  const displayProductInformationWarning =
    props.productInformationWarning ?? false;

  const thisBanner = (productInformationBanners ?? []).find(
    (thisBanner) => thisBanner.bannerLocation === props.bannerLocation
  );

  if (!thisBanner) {
    return null;
  }

  let hasBannerExpired = true;
  try {
    hasBannerExpired = isAfter(
      new Date().toISOString(),
      thisBanner?.expirationDate
    );
  } catch (err) {
    reportException(err);
  }

  if (hasBannerExpired) {
    return null;
  }

  return (
    <DismissibleBanner
      className={classNames({
        [classes.root]: true,
        [classes.important]: true,
        [classes.warning]: true,
        notice: true,
      })}
      preferenceKey={thisBanner.key}
      productInformationIndicator={displayProductInformationIndicator}
    >
      <>
        {displayProductInformationWarning ? (
          <Warning className={classes.icon} data-qa-warning-img />
        ) : null}
        <div className={classes.content}>
          <HighlightedMarkdown textOrMarkdown={thisBanner.message} />
        </div>
      </>
    </DismissibleBanner>
  );
};

export default React.memo(ProductInformationBanner);
