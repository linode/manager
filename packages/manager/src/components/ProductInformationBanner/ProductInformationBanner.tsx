import * as React from 'react';

import { ProductInformationBannerLocation } from 'src/featureFlags';
import useFlags from 'src/hooks/useFlags';
import DismissibleBanner from '../DismissibleBanner';
import HighlightedMarkdown from 'src/components/HighlightedMarkdown';
// import { productInformationBannerFactory } from 'src/factories/featureFlags';

interface Props {
  bannerLocation: ProductInformationBannerLocation;
}

const ProductInformationBanner: React.FC<Props> = (props) => {
  const { productInformationBanners } = useFlags();

  // const productInformationBanners = productInformationBannerFactory.buildList(
  //   1
  // );

  const thisBanner = (productInformationBanners ?? []).find(
    (thisBanner) => thisBanner.bannerLocation === props.bannerLocation
  );

  if (!thisBanner) {
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
