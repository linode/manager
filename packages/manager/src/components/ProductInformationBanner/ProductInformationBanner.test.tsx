import { screen } from '@testing-library/react';
import { DateTime } from 'luxon';
import * as React from 'react';

import { productInformationBannerFactory } from 'src/factories/featureFlags';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ProductInformationBanner } from './ProductInformationBanner';

import type { ProductInformationBannerFlag } from 'src/featureFlags';

const _render = (banner: ProductInformationBannerFlag) =>
  renderWithTheme(
    <ProductInformationBanner bannerLocation="Object Storage" />,
    { flags: { productInformationBanners: [banner] } }
  );

const bannerBase = productInformationBannerFactory.extend({
  bannerLocation:
    'Object Storage' as ProductInformationBannerFlag['bannerLocation'],
  message: 'Test Banner Message' as any,
});

describe('ProductionInformationBanner', () => {
  it("renders a banner if it hasn't expired", () => {
    const tomorrow = DateTime.local().plus({ day: 1 });
    const banner = bannerBase.build({
      expirationDate: tomorrow.toISO(),
    });
    _render(banner);

    expect(screen.queryByText(banner.message)).toBeInTheDocument();
  });

  it('does not render a banner if it has expired', async () => {
    const yesterday = DateTime.local().minus({ day: 1 });
    const banner = bannerBase.build({
      expirationDate: yesterday.toISO(),
    });
    _render(banner);

    expect(screen.queryByText(banner.message)).not.toBeInTheDocument();
  });

  it('does not render a banner if the location does not match', async () => {
    const banner = bannerBase.build({
      bannerLocation: 'Another Location' as any,
    });
    _render(banner);

    expect(screen.queryByText(banner.message)).not.toBeInTheDocument();
  });
});
