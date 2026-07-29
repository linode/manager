import '@testing-library/jest-dom';
import { act } from 'react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { MetadataBar } from './MetadataBar';

import type { MessageMetadata } from './ModelPlaygroundContext';

const BASE_TIME = 1_000_000_000_000;

const makeMetadata = (
  overrides: Partial<MessageMetadata> = {}
): MessageMetadata => ({ durationMs: 2000, ...overrides });

describe('MetadataBar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('pending state (no metadata)', () => {
    it('shows neither the check nor warning icon', () => {
      const { queryByTestId } = renderWithTheme(
        <MetadataBar startedAt={BASE_TIME - 500} />
      );
      expect(queryByTestId('CheckIcon')).not.toBeInTheDocument();
      expect(queryByTestId('WarningIcon')).not.toBeInTheDocument();
    });

    it('shows elapsed time and updates it as time passes', () => {
      const { getByText } = renderWithTheme(
        <MetadataBar startedAt={BASE_TIME - 1000} />
      );
      getByText('1.0s');
      act(() => {
        vi.advanceTimersByTime(500);
      });
      getByText('1.5s');
    });
  });

  describe('complete state (metadata without cancelled)', () => {
    it('shows the check icon and not the warning icon', () => {
      const { getByTestId, queryByTestId } = renderWithTheme(
        <MetadataBar metadata={makeMetadata()} startedAt={BASE_TIME - 2000} />
      );
      getByTestId('CheckIcon');
      expect(queryByTestId('WarningIcon')).not.toBeInTheDocument();
    });

    it('displays durationMs and does not tick elapsed when complete', () => {
      const { getByText } = renderWithTheme(
        <MetadataBar
          metadata={makeMetadata({ durationMs: 3500 })}
          startedAt={BASE_TIME - 5000}
        />
      );
      getByText('3.5s');
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      getByText('3.5s');
    });

    it('shows TTFT when timeToFirstTokenMs is provided', () => {
      const { container, getByText } = renderWithTheme(
        <MetadataBar
          metadata={makeMetadata()}
          startedAt={BASE_TIME - 2000}
          timeToFirstTokenMs={340}
        />
      );
      getByText('0.34s');
      expect(container).toHaveTextContent('TTFT');
    });

    it('hides Tokens/s when timeToFirstTokenMs is not provided', () => {
      const { container } = renderWithTheme(
        <MetadataBar
          metadata={makeMetadata({ completionTokens: 100, durationMs: 2000 })}
          startedAt={BASE_TIME - 2000}
        />
      );
      expect(container).not.toHaveTextContent('Tokens/s');
    });

    it('shows Tokens/s (decode-only) when timeToFirstTokenMs is provided', () => {
      const { container, getByText } = renderWithTheme(
        <MetadataBar
          metadata={makeMetadata({ completionTokens: 100, durationMs: 2000 })}
          startedAt={BASE_TIME - 2000}
          timeToFirstTokenMs={500}
        />
      );
      // 100 tokens / ((2000 - 500) / 1000) s = 100 / 1.5 ≈ 66.7
      getByText('66.7');
      expect(container).toHaveTextContent('Tokens/s');
    });

    it('shows In Tokens when promptTokens is provided', () => {
      const { container, getByText } = renderWithTheme(
        <MetadataBar
          metadata={makeMetadata({ promptTokens: 15 })}
          startedAt={BASE_TIME - 2000}
        />
      );
      getByText('15');
      expect(container).toHaveTextContent('In Tokens');
    });

    it('shows Out Tokens when completionTokens is provided', () => {
      const { container, getByText } = renderWithTheme(
        <MetadataBar
          metadata={makeMetadata({ completionTokens: 42 })}
          startedAt={BASE_TIME - 2000}
        />
      );
      getByText('42');
      expect(container).toHaveTextContent('Out Tokens');
    });

    it('hides stats for optional fields not present in metadata', () => {
      const { container } = renderWithTheme(
        <MetadataBar metadata={makeMetadata()} startedAt={BASE_TIME - 2000} />
      );
      expect(container).not.toHaveTextContent('TTFT');
      expect(container).not.toHaveTextContent('Tokens/s');
      expect(container).not.toHaveTextContent('In Tokens');
      expect(container).not.toHaveTextContent('Out Tokens');
    });
  });

  describe('cancelled state', () => {
    it('shows the warning icon and not the check icon', () => {
      const { getByTestId, queryByTestId } = renderWithTheme(
        <MetadataBar
          metadata={makeMetadata({ cancelled: true })}
          startedAt={BASE_TIME - 1000}
        />
      );
      getByTestId('WarningIcon');
      expect(queryByTestId('CheckIcon')).not.toBeInTheDocument();
    });

    it('shows "Response was cancelled" inline', () => {
      const { getByText } = renderWithTheme(
        <MetadataBar
          metadata={makeMetadata({ cancelled: true })}
          startedAt={BASE_TIME - 1000}
        />
      );
      getByText('Response was cancelled');
    });
  });

  describe('error state', () => {
    it('shows the error icon and not the check or warning icon', () => {
      const { getByTestId, queryByTestId } = renderWithTheme(
        <MetadataBar
          error="Something went wrong"
          startedAt={BASE_TIME - 1000}
        />
      );
      getByTestId('ErrorOutlineIcon');
      expect(queryByTestId('CheckIcon')).not.toBeInTheDocument();
      expect(queryByTestId('WarningIcon')).not.toBeInTheDocument();
    });

    it('displays the error message inline', () => {
      const { getByText } = renderWithTheme(
        <MetadataBar
          error="Something went wrong"
          startedAt={BASE_TIME - 1000}
        />
      );
      getByText('Something went wrong');
    });
  });
});
