import { Notice } from '@linode/ui';
import { screen } from '@testing-library/react';
import React from 'react';

import { planSelectionTypeFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  limitedAvailabilityBannerTestId,
  PlanInformation,
} from './PlanInformation';

import type { PlanInformationProps } from './PlanInformation';
import type { PlanSelectionType } from './types';

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

  it('should render additionalBanners when provided', () => {
    const infoBanner = (
      <Notice variant="info">This is an Information Notice</Notice>
    );
    const warningBanner = (
      <Notice variant="warning">This is a Warning Notice</Notice>
    );

    const additionalBanners = [infoBanner, warningBanner];
    renderWithTheme(
      <PlanInformation {...mockProps} additionalBanners={additionalBanners} />
    );
    const infoNotice = screen.getByText('This is an Information Notice');
    const warningNotice = screen.getByText('This is a Warning Notice');
    expect(infoNotice).toBeInTheDocument();
    expect(warningNotice).toBeInTheDocument();
  });

  it('should inform the user about Blackwell plans having limited availability when appropriate', () => {
    const mockPlan = planSelectionTypeFactory.build({
      class: 'gpu',
      id: 'g3-gpu-rtxpro6000-blackwell-1',
      planBelongsToDisabledClass: false,
      planHasLimitedAvailability: true,
      planIsDisabled512Gb: false,
      planIsSmallerThanUsage: false,
      planIsTooSmall: false,
      planIsTooSmallForAPL: undefined,
    });
    renderWithTheme(
      <PlanInformation
        {...mockProps}
        hasMajorityOfPlansDisabled={true}
        isSelectedRegionEligibleForPlan={true}
        plans={[mockPlan as PlanSelectionType]}
        planType="gpu"
      />
    );

    const blackwellLimitedAvailabilityBanner = screen.getByTestId(
      'blackwell-limited-availability-banner'
    );
    expect(blackwellLimitedAvailabilityBanner).toBeInTheDocument();
  });

  it('does not inform the user about Blackwell plans having limited availability when user does not have access to blackwell plans', () => {
    const mockPlan = planSelectionTypeFactory.build({
      class: 'gpu',
      id: 'g3-gpu-rtx4000',
      planBelongsToDisabledClass: false,
      planHasLimitedAvailability: true,
      planIsDisabled512Gb: false,
      planIsSmallerThanUsage: false,
      planIsTooSmall: false,
      planIsTooSmallForAPL: undefined,
    });
    renderWithTheme(
      <PlanInformation
        {...mockProps}
        hasMajorityOfPlansDisabled={true}
        isSelectedRegionEligibleForPlan={true}
        plans={[mockPlan as PlanSelectionType]}
        planType="gpu"
      />
    );

    const blackwellLimitedAvailabilityBanner = screen.queryByTestId(
      'blackwell-limited-availability-banner'
    );
    expect(blackwellLimitedAvailabilityBanner).not.toBeInTheDocument();
  });

  it('does not inform the user about Blackwell plans having limited availability when user has access to blackwell plans and are available', () => {
    const mockPlan = planSelectionTypeFactory.build({
      class: 'gpu',
      id: 'g3-gpu-rtxpro6000-blackwell-1',
      planBelongsToDisabledClass: false,
      planHasLimitedAvailability: false,
      planIsDisabled512Gb: false,
      planIsSmallerThanUsage: false,
      planIsTooSmall: false,
      planIsTooSmallForAPL: undefined,
    });
    renderWithTheme(
      <PlanInformation
        {...mockProps}
        hasMajorityOfPlansDisabled={true}
        isSelectedRegionEligibleForPlan={true}
        plans={[mockPlan as PlanSelectionType]}
        planType="gpu"
      />
    );

    const blackwellLimitedAvailabilityBanner = screen.queryByTestId(
      'blackwell-limited-availability-banner'
    );
    expect(blackwellLimitedAvailabilityBanner).not.toBeInTheDocument();
  });
});
