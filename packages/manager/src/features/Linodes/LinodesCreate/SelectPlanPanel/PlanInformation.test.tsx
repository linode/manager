import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { PlanInformation } from './PlanInformation';

jest.mock('src/hooks/useFlags', () => ({
  __esModule: true,
  default: jest.fn(),
}));

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
});
