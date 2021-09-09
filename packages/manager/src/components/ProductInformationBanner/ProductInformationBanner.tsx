import * as React from 'react';

import { ProductInformationBannerLocation } from 'src/featureFlags';
import useFlags from 'src/hooks/useFlags';
import DismissibleBanner from '../DismissibleBanner';
import HighlightedMarkdown from 'src/components/HighlightedMarkdown';
import { isAfter } from 'src/utilities/date';
import { reportException } from 'src/exceptionReporting';

interface Props {
  bannerLocation: ProductInformationBannerLocation;
}

const ProductInformationBanner: React.FC<Props> = (props) => {
  const { productInformationBanners } = useFlags();

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
      preferenceKey={thisBanner.key}
      productInformationIndicator
    >
      <HighlightedMarkdown textOrMarkdown={thisBanner.message} />
    </DismissibleBanner>
  );
};

export default React.memo(ProductInformationBanner);
