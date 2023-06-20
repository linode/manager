import React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { PlansAvailabilityNotice } from './PlansAvailabilityNotice';
import { regionFactory } from 'src/factories/regions';
import type { PlansAvailabilityNoticeProps } from './PlansAvailabilityNotice';
import type { Region } from '@linode/api-v4';

const mockedRegionData: Region[] = [
  ...regionFactory.buildList(2, {}),
  ...regionFactory.buildList(1, { capabilities: ['Premium Plans'] }),
];

describe('PlansAvailabilityNotice', () => {
  it('renders an error premium notice when isSelectedRegionEligible is false and hasSelectedRegion is true', async () => {
    const props: PlansAvailabilityNoticeProps = {
      isSelectedRegionEligible: false,
      hasSelectedRegion: true,
      regionsData: mockedRegionData,
      planType: 'premium',
    };

    const { getByTestId } = renderWithTheme(
      <PlansAvailabilityNotice {...props} />
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
    const props: PlansAvailabilityNoticeProps = {
      isSelectedRegionEligible: false,
      hasSelectedRegion: false,
      regionsData: mockedRegionData,
      planType: 'premium',
    };

    const { getByTestId } = renderWithTheme(
      <PlansAvailabilityNotice {...props} />
    );

    expect(getByTestId('premium-notice-warning')).toBeInTheDocument();
    expect(getByTestId('premium-notice-warning')).toHaveAttribute(
      'data-testid',
      'premium-notice-warning'
    );
    expect(getByTestId('premium-notice-warning')).toHaveTextContent(
      'premium Plans are currently available in'
    );
  });

  it('renders no notice when isSelectedRegionPremium is true', () => {
    const props: PlansAvailabilityNoticeProps = {
      isSelectedRegionEligible: true,
      hasSelectedRegion: true,
      regionsData: mockedRegionData,
      planType: 'premium',
    };

    const { queryByTestId } = renderWithTheme(
      <PlansAvailabilityNotice {...props} />
    );

    expect(queryByTestId(/premium-notice/)).not.toBeInTheDocument();
  });
});
