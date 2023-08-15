import * as React from 'react';

import { HighlightedMarkdown } from 'src/components/HighlightedMarkdown/HighlightedMarkdown';
import { reportException } from 'src/exceptionReporting';
import {
  ProductInformationBannerDecoration,
  ProductInformationBannerLocation,
} from 'src/featureFlags';
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

    const thisBannerDecoration: ProductInformationBannerDecoration =
      thisBanner.decoration;
    thisBannerDecoration.important =
      thisBannerDecoration.important === 'true'
        ? true
        : thisBannerDecoration.important === 'false'
        ? false
        : true;

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
        important={thisBannerDecoration.important}
        preferenceKey={`${bannerLocation}-${thisBanner.expirationDate}`}
        variant={thisBannerDecoration.variant ?? 'warning'}
        {...rest}
      >
        <HighlightedMarkdown textOrMarkdown={thisBanner.message} />
      </DismissibleBanner>
    );
  }
);
