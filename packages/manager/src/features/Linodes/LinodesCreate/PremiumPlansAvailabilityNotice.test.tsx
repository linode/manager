import React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { PremiumPlansAvailabilityNotice } from './PremiumPlansAvailabilityNotice';
import { regionFactory } from 'src/factories/regions';
import type { PremiumPlansAvailabilityNoticeProps } from './PremiumPlansAvailabilityNotice';
import type { Region } from '@linode/api-v4';

const mockedRegionData: Region[] = [
  ...regionFactory.buildList(2, {}),
  ...regionFactory.buildList(1, { capabilities: ['Premium Plans'] }),
];

describe('PremiumPlansAvailabilityNotice', () => {
  it('renders an error premium notice when isSelectedRegionPremium is false and hasSelectedRegion is true', async () => {
    const props: PremiumPlansAvailabilityNoticeProps = {
      isSelectedRegionPremium: false,
      hasSelectedRegion: true,
      regionsData: mockedRegionData,
    };

    const { getByTestId } = renderWithTheme(
      <PremiumPlansAvailabilityNotice {...props} />
    );

    expect(getByTestId('premium-notice-error')).toBeInTheDocument();
    expect(getByTestId('premium-notice-error')).toHaveAttribute(
      'data-testid',
      'premium-notice-error'
    );
    expect(getByTestId('premium-notice-error')).toHaveTextContent(
      'Premium Plans are not currently available in this region.'
    );
  });

  it('renders an error premium notice when isSelectedRegionPremium is false and hasSelectedRegion is false', () => {
    const props = {
      isSelectedRegionPremium: false,
      hasSelectedRegion: false,
      regionsData: mockedRegionData,
    };

    const { getByTestId } = renderWithTheme(
      <PremiumPlansAvailabilityNotice {...props} />
    );

    expect(getByTestId('premium-notice-warning')).toBeInTheDocument();
    expect(getByTestId('premium-notice-warning')).toHaveAttribute(
      'data-testid',
      'premium-notice-warning'
    );
    expect(getByTestId('premium-notice-warning')).toHaveTextContent(
      'Premium Plans are currently available in'
    );
  });

  it('renders no notice when isSelectedRegionPremium is true', () => {
    const props = {
      isSelectedRegionPremium: true,
      hasSelectedRegion: true,
      regionsData: mockedRegionData,
    };

    const { queryByTestId } = renderWithTheme(
      <PremiumPlansAvailabilityNotice {...props} />
    );

    expect(queryByTestId(/premium-notice/)).not.toBeInTheDocument();
  });
});
