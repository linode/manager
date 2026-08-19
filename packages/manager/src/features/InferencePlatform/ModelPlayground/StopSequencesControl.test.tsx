import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { StopSequencesControl } from './StopSequencesControl';

// Replace CDS web components with plain HTML equivalents so Lit's lifecycle
// never runs in JSDOM, avoiding ElementInternals unhandled rejections entirely.
// TagInput fires custom change events — the ref bridges the React prop to the DOM
// change listener, mirroring what @lit/react createComponent does internally.
vi.mock('@akamai/cds-components/react', () => ({
  TagInput: ({
    onChange,
  }: {
    onChange?: (e: CustomEvent<unknown[]>) => void;
    value?: unknown[];
  }) => (
    <div
      aria-label="stop sequences"
      ref={(el) => {
        if (el && onChange) {
          el.addEventListener('change', onChange as EventListener);
        }
      }}
      role="list"
    />
  ),
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

describe('StopSequencesControl', () => {
  describe('handleChange', () => {
    it('calls onChange with undefined when the array is empty', () => {
      const onChange = vi.fn();
      const { getByRole } = renderWithTheme(
        <StopSequencesControl onChange={onChange} value={undefined} />
      );
      fireEvent(getByRole('list'), new CustomEvent('change', { detail: [] }));
      expect(onChange).toHaveBeenCalledWith(undefined);
    });

    it('calls onChange with the string array when the array is non-empty', () => {
      const onChange = vi.fn();
      const { getByRole } = renderWithTheme(
        <StopSequencesControl onChange={onChange} value={undefined} />
      );
      fireEvent(
        getByRole('list'),
        new CustomEvent('change', { detail: ['</s>'] })
      );
      expect(onChange).toHaveBeenCalledWith(['</s>']);
    });
  });
});
