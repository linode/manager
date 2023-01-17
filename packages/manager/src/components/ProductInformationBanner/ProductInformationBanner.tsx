import * as React from 'react';
import { makeStyles } from 'src/components/core/styles';
import HighlightedMarkdown from 'src/components/HighlightedMarkdown';
import { NoticeProps } from 'src/components/Notice';
import { reportException } from 'src/exceptionReporting';
import { ProductInformationBannerLocation } from 'src/featureFlags';
import useFlags from 'src/hooks/useFlags';
import { isAfter } from 'src/utilities/date';
import DismissibleBanner from '../DismissibleBanner';

const useStyles = makeStyles(() => ({
  content: {
    // Compensate for HighlightedMarkdown component's margin.
    marginLeft: '-8px',
    width: '100%',
  },
}));

interface Props {
  bannerLocation: ProductInformationBannerLocation;
}

type CombinedProps = Props & Partial<NoticeProps>;

const ProductInformationBanner = (props: CombinedProps) => {
  const { bannerLocation, ...rest } = props;
  const { productInformationBanners } = useFlags();

  const classes = useStyles();

  const thisBanner = (productInformationBanners ?? []).find(
    (thisBanner) => thisBanner.bannerLocation === bannerLocation
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
      preferenceKey={`${bannerLocation}-${thisBanner.expirationDate}`}
      {...rest}
    >
      <div className={classes.content}>
        <HighlightedMarkdown textOrMarkdown={thisBanner.message} />
      </div>
    </DismissibleBanner>
  );
};

export default React.memo(ProductInformationBanner);
