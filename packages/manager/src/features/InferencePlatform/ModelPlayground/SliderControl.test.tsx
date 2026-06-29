import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { SliderControl } from './SliderControl';

const defaultProps = {
  label: 'Temperature',
  max: 2,
  min: 0,
  onChange: vi.fn(),
  step: 0.1,
  tooltip: 'Controls randomness.',
  value: 1,
};

describe('SliderControl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('effectiveValue', () => {
    it('displays min when value is undefined', () => {
      const { getByRole } = renderWithTheme(
        <SliderControl {...defaultProps} value={undefined} />
      );
      expect(getByRole('spinbutton')).toHaveValue(defaultProps.min);
    });

    it('displays the provided value when defined', () => {
      const { getByRole } = renderWithTheme(
        <SliderControl {...defaultProps} value={0.5} />
      );
      expect(getByRole('spinbutton')).toHaveValue(0.5);
    });
  });

  describe('handleInputChange', () => {
    it('calls onChange with the typed value when in range', async () => {
      const user = userEvent.setup();
      const { getByRole } = renderWithTheme(
        <SliderControl {...defaultProps} value={1} />
      );
      const input = getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '1.5');
      expect(defaultProps.onChange).toHaveBeenLastCalledWith(1.5);
    });

    it('clamps above max to max', async () => {
      const user = userEvent.setup();
      const { getByRole } = renderWithTheme(
        <SliderControl {...defaultProps} value={1} />
      );
      const input = getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '999');
      expect(defaultProps.onChange).toHaveBeenLastCalledWith(defaultProps.max);
    });
  });

  describe('slider', () => {
    it('reflects effectiveValue via aria-valuenow', () => {
      const { getByRole } = renderWithTheme(
        <SliderControl {...defaultProps} value={1.5} />
      );
      expect(getByRole('slider')).toHaveAttribute('aria-valuenow', '1.5');
    });

    it('shows min via aria-valuenow when value is undefined', () => {
      const { getByRole } = renderWithTheme(
        <SliderControl {...defaultProps} value={undefined} />
      );
      expect(getByRole('slider')).toHaveAttribute(
        'aria-valuenow',
        String(defaultProps.min)
      );
    });
  });
});
