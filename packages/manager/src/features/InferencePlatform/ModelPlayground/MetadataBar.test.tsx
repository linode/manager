import '@testing-library/jest-dom';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { MetadataBar } from './MetadataBar';

import type { MessageMetadata } from './ModelPlaygroundContext';

const makeMetadata = (
  overrides: Partial<MessageMetadata> = {}
): MessageMetadata => ({ durationMs: 2000, ...overrides });

describe('MetadataBar', () => {
  describe('pending state (no metadata)', () => {
    it('shows neither the check nor warning icon', () => {
      const { queryByRole } = renderWithTheme(<MetadataBar />);
      expect(queryByRole('img', { name: 'Success' })).not.toBeInTheDocument();
      expect(queryByRole('img', { name: 'Warning' })).not.toBeInTheDocument();
    });

    it('hides response time until the request completes', () => {
      const { queryByText } = renderWithTheme(<MetadataBar />);
      expect(queryByText('Response Time')).not.toBeInTheDocument();
    });

    it('shows an indeterminate loader', () => {
      const { getByRole } = renderWithTheme(<MetadataBar />);
      getByRole('progressbar', { name: 'Generating response' });
    });

    it('keeps the same minimum height as a completed response', () => {
      const { container } = renderWithTheme(<MetadataBar />);
      expect(container.firstElementChild).toHaveStyle({ minHeight: '32px' });
    });
  });

  describe('complete state (metadata without cancelled)', () => {
    it('shows the check icon and not the warning icon', () => {
      const { getByRole, queryByRole } = renderWithTheme(
        <MetadataBar metadata={makeMetadata()} />
      );
      getByRole('img', { name: 'Success' });
      expect(queryByRole('img', { name: 'Warning' })).not.toBeInTheDocument();
    });

    it('displays durationMs when complete', () => {
      const { getByText, queryByRole } = renderWithTheme(
        <MetadataBar metadata={makeMetadata({ durationMs: 3500 })} />
      );
      getByText('3.5s');
      expect(
        queryByRole('progressbar', { name: 'Generating response' })
      ).not.toBeInTheDocument();
    });

    it('shows TTFT when timeToFirstTokenMs is provided', () => {
      const { container, getByText } = renderWithTheme(
        <MetadataBar metadata={makeMetadata()} timeToFirstTokenMs={340} />
      );
      getByText('0.34s');
      expect(container).toHaveTextContent('TTFT');
    });

    it('hides Tokens/s when timeToFirstTokenMs is not provided', () => {
      const { container } = renderWithTheme(
        <MetadataBar
          metadata={makeMetadata({ completionTokens: 100, durationMs: 2000 })}
        />
      );
      expect(container).not.toHaveTextContent('Tokens/s');
    });

    it('shows Tokens/s (decode-only) when timeToFirstTokenMs is provided', () => {
      const { container, getByText } = renderWithTheme(
        <MetadataBar
          metadata={makeMetadata({ completionTokens: 100, durationMs: 2000 })}
          timeToFirstTokenMs={500}
        />
      );
      // 100 tokens / ((2000 - 500) / 1000) s = 100 / 1.5 ≈ 66.7
      getByText('66.7');
      expect(container).toHaveTextContent('Tokens/s');
    });

    it('shows In Tokens when promptTokens is provided', () => {
      const { container, getByText } = renderWithTheme(
        <MetadataBar metadata={makeMetadata({ promptTokens: 15 })} />
      );
      getByText('15');
      expect(container).toHaveTextContent('In Tokens');
    });

    it('shows Out Tokens when completionTokens is provided', () => {
      const { container, getByText } = renderWithTheme(
        <MetadataBar metadata={makeMetadata({ completionTokens: 42 })} />
      );
      getByText('42');
      expect(container).toHaveTextContent('Out Tokens');
    });

    it('hides stats for optional fields not present in metadata', () => {
      const { container } = renderWithTheme(
        <MetadataBar metadata={makeMetadata()} />
      );
      expect(container).not.toHaveTextContent('TTFT');
      expect(container).not.toHaveTextContent('Tokens/s');
      expect(container).not.toHaveTextContent('In Tokens');
      expect(container).not.toHaveTextContent('Out Tokens');
    });
  });

  describe('cancelled state', () => {
    it('shows the warning icon and not the check icon', () => {
      const { getByRole, queryByRole } = renderWithTheme(
        <MetadataBar metadata={makeMetadata({ cancelled: true })} />
      );
      getByRole('img', { name: 'Warning' });
      expect(queryByRole('img', { name: 'Success' })).not.toBeInTheDocument();
    });

    it('shows "Response was cancelled" inline', () => {
      const { getByText } = renderWithTheme(
        <MetadataBar metadata={makeMetadata({ cancelled: true })} />
      );
      getByText('Response was cancelled');
    });
  });

  describe('error state', () => {
    it('shows the error icon and not the check or warning icon', () => {
      const { getByRole, queryByRole } = renderWithTheme(
        <MetadataBar error="Something went wrong" />
      );
      getByRole('img', { name: 'Error' });
      expect(queryByRole('img', { name: 'Success' })).not.toBeInTheDocument();
      expect(queryByRole('img', { name: 'Warning' })).not.toBeInTheDocument();
    });

    it('displays the error message inline', () => {
      const { getByText } = renderWithTheme(
        <MetadataBar error="Something went wrong" />
      );
      getByText('Something went wrong');
    });
  });
});
