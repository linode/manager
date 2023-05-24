import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { PlanInformation } from './PlanInformation';

describe('PlanInformation', () => {
  it('should render without errors', () => {
    renderWithTheme(<PlanInformation planType="standard" />);
  });

  it('should render GPUNotice when planType is "gpu"', () => {
    renderWithTheme(<PlanInformation planType="gpu" />);
    const element = screen.getByTestId('gpu-notice');
    expect(element).toBeInTheDocument();
  });

  it('should render MetalNotice when planType is "metal"', () => {
    renderWithTheme(<PlanInformation planType="metal" />);
    const element = screen.getByTestId('metal-notice');
    expect(element).toBeInTheDocument();
  });

  it('should render notice when planType is "premium"', () => {
    renderWithTheme(<PlanInformation planType="premium" />);
    const element = screen.getByTestId('premium-notice');
    expect(element).toBeInTheDocument();
  });
});
