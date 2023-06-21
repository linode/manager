import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { PlanInformation } from './PlanInformation';
import type { PlanInformationProps } from './PlanInformation';

jest.mock('src/hooks/useFlags', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockProps: PlanInformationProps = {
  planType: 'standard',
  hasSelectedRegion: true,
  isSelectedRegionPremium: false,
};

describe('PlanInformation', () => {
  it('should render without errors', () => {
    renderWithTheme(<PlanInformation {...mockProps} />);
  });

  it('should render GPUNotice when planType is "gpu"', () => {
    renderWithTheme(<PlanInformation {...mockProps} planType="gpu" />);
    const element = screen.getByTestId('gpu-notice');
    expect(element).toBeInTheDocument();
  });

  it('should render MetalNotice when planType is "metal"', () => {
    renderWithTheme(<PlanInformation {...mockProps} planType="metal" />);
    const element = screen.getByTestId('metal-notice');
    expect(element).toBeInTheDocument();
  });
});
