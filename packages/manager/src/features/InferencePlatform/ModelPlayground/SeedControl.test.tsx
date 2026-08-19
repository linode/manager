import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { SeedControl } from './SeedControl';

// Replace CDS web components with plain HTML equivalents so Lit's lifecycle
// never runs in JSDOM, avoiding ElementInternals unhandled rejections entirely.
vi.mock('@akamai/cds-components/react', () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button onClick={onClick} type="button">
      {children}
    </button>
  ),
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
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

const MAX_SEED = 2_147_483_647;

describe('SeedControl', () => {
  describe('handleChange', () => {
    it('calls onChange with the parsed integer when a number is typed', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { getByRole } = renderWithTheme(
        <SeedControl onChange={onChange} value={undefined} />
      );
      await user.type(getByRole('spinbutton'), '5');
      expect(onChange).toHaveBeenCalledWith(5);
    });

    it('calls onChange with undefined when the input is cleared', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { getByRole } = renderWithTheme(
        <SeedControl onChange={onChange} value={42} />
      );
      await user.clear(getByRole('spinbutton'));
      expect(onChange).toHaveBeenCalledWith(undefined);
    });

    it('passes through 0 without treating it as empty', async () => {
      // Verifies ?? is used rather than ||: 0 is a valid seed and must not
      // be coerced to undefined.
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { getByRole } = renderWithTheme(
        <SeedControl onChange={onChange} value={undefined} />
      );
      await user.type(getByRole('spinbutton'), '0');
      expect(onChange).toHaveBeenCalledWith(0);
    });
  });

  describe('handleRandomize', () => {
    it('calls onChange with a number in the valid seed range when New Seed is clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { getByRole } = renderWithTheme(
        <SeedControl onChange={onChange} value={undefined} />
      );
      await user.click(getByRole('button', { name: /new seed/i }));
      expect(onChange).toHaveBeenCalledOnce();
      const seed = onChange.mock.calls[0][0] as number;
      expect(seed).toBeGreaterThanOrEqual(0);
      expect(seed).toBeLessThanOrEqual(MAX_SEED);
    });
  });
});
