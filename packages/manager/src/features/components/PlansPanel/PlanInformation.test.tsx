import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  PlanInformation,
  limitedAvailabilityBannerTestId,
} from './PlanInformation';

import type { PlanInformationProps } from './PlanInformation';

const mockProps: PlanInformationProps = {
  flow: 'linode',
  hasMajorityOfPlansDisabled: false,
  hasSelectedRegion: true,
  isAPLEnabled: true,
  isSelectedRegionEligibleForPlan: false,
  planType: 'standard',
};

describe('PlanInformation', () => {
  it('should render without errors', () => {
    renderWithTheme(<PlanInformation {...mockProps} />);
  });

  it('should render GPUNotice when planType is "gpu"', () => {
    renderWithTheme(<PlanInformation {...mockProps} planType="gpu" />);
    const element = screen.getByTestId('gpu-notice-error');
    expect(element).toBeInTheDocument();
  });

  it('should render APLNotice when planType is "shared" and APL is enabled', () => {
    renderWithTheme(<PlanInformation {...mockProps} planType="shared" />);
    const element = screen.getByTestId('apl-notice');
    expect(element).toBeInTheDocument();
  });

  it('should render MetalNotice when planType is "metal"', () => {
    renderWithTheme(<PlanInformation {...mockProps} planType="metal" />);
    const element = screen.getByTestId('metal-notice');
    expect(element).toBeInTheDocument();
  });

  it('should inform the user about Dedicated plans having limited availability when appropriate', () => {
    renderWithTheme(
      <PlanInformation
        {...mockProps}
        hasMajorityOfPlansDisabled={true}
        isSelectedRegionEligibleForPlan={true}
        planType="dedicated"
      />
    );

    const limitedAvailabilityBanner = screen.getByTestId(
      limitedAvailabilityBannerTestId
    );
    expect(limitedAvailabilityBanner).toBeInTheDocument();
  });
});
