import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { StopSequencesControl } from './StopSequencesControl';

describe('StopSequencesControl', () => {
  describe('handleChange', () => {
    it('calls onChange with undefined when the last chip is deleted', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { getByRole } = renderWithTheme(
        <StopSequencesControl onChange={onChange} value={['</s>']} />
      );
      await user.click(getByRole('combobox'));
      await user.keyboard('{Backspace}');
      expect(onChange).toHaveBeenCalledWith(undefined);
    });

    it('calls onChange with the remaining array when one of many chips is deleted', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { getByRole } = renderWithTheme(
        <StopSequencesControl onChange={onChange} value={['</s>', '<|end|>']} />
      );
      await user.click(getByRole('combobox'));
      await user.keyboard('{Backspace}');
      expect(onChange).toHaveBeenCalledWith(['</s>']);
    });

    it('calls onChange with a string array when a sequence is added', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { getByRole } = renderWithTheme(
        <StopSequencesControl onChange={onChange} value={undefined} />
      );
      await user.type(getByRole('combobox'), '</s>');
      await user.keyboard('{Enter}');
      expect(onChange).toHaveBeenCalledWith(['</s>']);
    });
  });
});
