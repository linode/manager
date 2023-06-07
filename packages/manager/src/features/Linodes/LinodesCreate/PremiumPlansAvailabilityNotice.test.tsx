import React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { PremiumPlansAvailabilityNotice } from './PremiumPlansAvailabilityNotice';

jest.mock('src/hooks/useFlags', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('PremiumPlansAvailabilityNotice', () => {
  it('should render Notice component when premiumPlansAvailabilityNotice is truthy', () => {
    // Mock the useFlags hook to return a truthy value
    const useFlagsMock = jest.fn().mockReturnValue({
      premiumPlansAvailabilityNotice: 'Premium plans are available!',
    });
    require('src/hooks/useFlags').default = useFlagsMock;

    const { getByTestId } = renderWithTheme(<PremiumPlansAvailabilityNotice />);

    // Assert that Notice component is rendered with the correct message
    expect(getByTestId('premium-notice').textContent).toBe(
      'Premium plans are available!'
    );
  });

  it('should not render Notice component when premiumPlansAvailabilityNotice is falsy', () => {
    // Mock the useFlags hook to return a falsy value
    const useFlagsMock = jest.fn().mockReturnValue({
      premiumPlansAvailabilityNotice: null,
    });
    require('src/hooks/useFlags').default = useFlagsMock;

    const { queryByTestId } = renderWithTheme(
      <PremiumPlansAvailabilityNotice />
    );

    // Assert that Notice component is not rendered
    expect(queryByTestId('premium-notice')).toBeNull();
  });
});
