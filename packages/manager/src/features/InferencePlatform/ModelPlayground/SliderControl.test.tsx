import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { SliderControl } from './SliderControl';

// Replace CDS web components with plain HTML equivalents so Lit's lifecycle
// never runs in JSDOM, avoiding ElementInternals unhandled rejections entirely.
vi.mock('@akamai/cds-components/react', () => ({
  NumericSpinner: ({
    onChange,
    value,
  }: {
    onChange?: (e: CustomEvent<null | number>) => void;
    value?: null | number;
  }) => (
    <input
      defaultValue={value ?? ''}
      onChange={(e) => {
        const val = e.target.value === '' ? null : parseFloat(e.target.value);
        onChange?.(new CustomEvent('change', { detail: val }));
      }}
      role="spinbutton"
      type="number"
    />
  ),
  Tooltip: ({
    children,
    tooltipText,
  }: {
    children: React.ReactNode;
    tooltipText: string;
  }) => (
    <span aria-label={tooltipText} role="tooltip">
      {children}
    </span>
  ),
}));

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

  describe('tooltip', () => {
    it('does not render when a description is unavailable', () => {
      const { queryByRole } = renderWithTheme(
        <SliderControl {...defaultProps} tooltip={undefined} />
      );

      expect(queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('handleInputChange', () => {
    it('calls onChange with the typed value when in range', async () => {
      const user = userEvent.setup();
      const { getByRole } = renderWithTheme(
        <SliderControl {...defaultProps} value={1} />
      );
      await user.clear(getByRole('spinbutton'));
      await user.type(getByRole('spinbutton'), '1.5');
      expect(defaultProps.onChange).toHaveBeenCalledWith(1.5);
    });

    it('clamps above max to max', async () => {
      const user = userEvent.setup();
      const { getByRole } = renderWithTheme(
        <SliderControl {...defaultProps} value={1} />
      );
      await user.clear(getByRole('spinbutton'));
      await user.type(getByRole('spinbutton'), '999');
      expect(defaultProps.onChange).toHaveBeenCalledWith(defaultProps.max);
    });

    it('clamps below min to min', async () => {
      const user = userEvent.setup();
      const { getByRole } = renderWithTheme(
        <SliderControl {...defaultProps} value={1} />
      );
      await user.clear(getByRole('spinbutton'));
      await user.type(getByRole('spinbutton'), '-1');
      expect(defaultProps.onChange).toHaveBeenCalledWith(defaultProps.min);
    });

    it('does not call onChange when detail is null', async () => {
      const user = userEvent.setup();
      const { getByRole } = renderWithTheme(
        <SliderControl {...defaultProps} value={1} />
      );
      await user.clear(getByRole('spinbutton'));
      expect(defaultProps.onChange).not.toHaveBeenCalled();
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

  describe('parameters without both bounds', () => {
    it.each([
      { max: undefined, min: 0 },
      { max: 2, min: undefined },
      { max: undefined, min: undefined },
    ])('renders only an unconstrained number input', ({ max, min }) => {
      const { getByRole, queryByRole } = renderWithTheme(
        <SliderControl {...defaultProps} max={max} min={min} />
      );

      expect(getByRole('spinbutton')).toBeVisible();
      expect(queryByRole('slider')).not.toBeInTheDocument();
    });

    it.each([
      { expectedValue: 0, max: undefined, min: 0, typedValue: '-1' },
      { expectedValue: 2, max: 2, min: undefined, typedValue: '999' },
      { expectedValue: 999, max: undefined, min: undefined, typedValue: '999' },
    ])(
      'clamps to a defined bound without rendering a slider',
      async ({ expectedValue, max, min, typedValue }) => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        const { getByRole } = renderWithTheme(
          <SliderControl
            {...defaultProps}
            max={max}
            min={min}
            onChange={onChange}
            value={1}
          />
        );

        const input = getByRole('spinbutton');
        await user.clear(input);
        await user.type(input, typedValue);

        expect(onChange).toHaveBeenCalledWith(expectedValue);
      }
    );
  });
});
