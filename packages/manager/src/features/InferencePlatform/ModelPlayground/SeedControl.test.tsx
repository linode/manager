import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { SeedControl } from './SeedControl';

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
      expect(onChange).toHaveBeenLastCalledWith(5);
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

    it('clamps to MAX_SEED when a value above the maximum is entered', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { getByRole } = renderWithTheme(
        <SeedControl onChange={onChange} value={MAX_SEED} />
      );
      await user.type(getByRole('spinbutton'), '0');
      expect(onChange).toHaveBeenLastCalledWith(MAX_SEED);
    });
  });

  describe('handleRandomize', () => {
    it('calls onChange with a number in the valid seed range when New Seed is clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { getByRole } = renderWithTheme(
        <SeedControl onChange={onChange} value={undefined} />
      );
      await user.click(getByRole('button', { name: /generate random seed/i }));
      expect(onChange).toHaveBeenCalledOnce();
      const seed = onChange.mock.calls[0][0] as number;
      expect(seed).toBeGreaterThanOrEqual(0);
      expect(seed).toBeLessThanOrEqual(MAX_SEED);
    });
  });
});
