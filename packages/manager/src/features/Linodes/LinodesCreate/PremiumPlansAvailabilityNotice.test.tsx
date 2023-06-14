import React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { PremiumPlansAvailabilityNotice } from './PremiumPlansAvailabilityNotice';
import type { PremiumPlansAvailabilityNoticeProps } from './PremiumPlansAvailabilityNotice';
import type { Region } from '@linode/api-v4';

const mockedRegionData: Region[] = [
  {
    id: '1',
    label: 'Region 1',
    capabilities: ['Linodes'],
    country: 'US',
    status: 'ok',
    resolvers: { ipv4: '', ipv6: '' },
  },
  {
    id: '2',
    label: 'Region 2',
    capabilities: ['Premium'],
    country: 'US',
    status: 'ok',
    resolvers: { ipv4: '', ipv6: '' },
  },
  {
    id: '3',
    label: 'Region 3',
    capabilities: ['Linodes'],
    country: 'US',
    status: 'ok',
    resolvers: { ipv4: '', ipv6: '' },
  },
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
