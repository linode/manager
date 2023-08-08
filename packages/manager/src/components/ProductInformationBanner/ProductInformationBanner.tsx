import * as React from 'react';

import { HighlightedMarkdown } from 'src/components/HighlightedMarkdown/HighlightedMarkdown';
import { reportException } from 'src/exceptionReporting';
import { ProductInformationBannerLocation } from 'src/featureFlags';
import { useFlags } from 'src/hooks/useFlags';
import { isAfter } from 'src/utilities/date';

import { DismissibleBanner } from '../DismissibleBanner';

import type { NoticeProps } from 'src/components/Notice/Notice';

interface Props {
  bannerLocation: ProductInformationBannerLocation;
}

type ProductInformationBannerProps = Props & Partial<NoticeProps>;

export const ProductInformationBanner = React.memo(
  (props: ProductInformationBannerProps) => {
    const { bannerLocation, ...rest } = props;
    const { productInformationBanners } = useFlags();

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
        <HighlightedMarkdown textOrMarkdown={thisBanner.message} />
      </DismissibleBanner>
    );
  }
);
