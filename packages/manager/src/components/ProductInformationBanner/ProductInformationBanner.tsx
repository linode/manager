import * as React from 'react';

import { Markdown } from 'src/components/Markdown/Markdown';
import { reportException } from 'src/exceptionReporting';
import { useFlags } from 'src/hooks/useFlags';
import { isAfter } from 'src/utilities/date';

import { DismissibleBanner } from '../DismissibleBanner/DismissibleBanner';

import type { NoticeProps } from '@linode/ui';
import type { ProductInformationBannerLocation } from 'src/featureFlags';

interface Props {
  bannerLocation: ProductInformationBannerLocation;
}

interface ProductInformationBannerProps extends Props, Partial<NoticeProps> {}

export const ProductInformationBanner = React.memo(
  (props: ProductInformationBannerProps) => {
    const { bannerLocation, ...rest } = props;
    const { productInformationBanners } = useFlags();

    // const thisBanner = {
    //   bannerLocation: 'Linodes',
    //   decoration: {
    //     important: 'true',
    //     variant: 'warning',
    //   },
    //   expirationDate: '2030-08-01',
    //   key: 'key1',
    //   // safe
    //   message: 'Test message',
    // };

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
        variant={thisBanner.decoration.variant ?? 'warning'}
        {...rest}
      >
        <Markdown textOrMarkdown={thisBanner.message} />
      </DismissibleBanner>
    );
  }
);
