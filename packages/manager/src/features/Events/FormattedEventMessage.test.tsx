import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { FormattedEventMessage } from './FormattedEventMessage';

describe('FormattedEventMessage', () => {
  it('renders null when message is null', () => {
    const { queryByRole } = renderWithTheme(
      <FormattedEventMessage message={null} />
    );

    expect(queryByRole('pre')).toBeNull();
  });

  it('renders message without ticks as plain text', () => {
    const { getByText, queryByRole } = renderWithTheme(
      <FormattedEventMessage message="Hello, world!" />
    );

    expect(getByText('Hello, world!')).toBeInTheDocument();
    expect(queryByRole('pre')).toBeNull();
  });

  it('renders message with ticks as inline code blocks', () => {
    const { container, getByText } = renderWithTheme(
      <FormattedEventMessage message="Hello, `world`!" />
    );

    expect(getByText(/Hello,/)).toBeInTheDocument();
    expect(container.querySelector('pre')).toHaveTextContent('world');
  });

  it('converts contact support links', () => {
    const { container, getByText } = renderWithTheme(
      <FormattedEventMessage message="Please contact Support" />
    );

    expect(getByText('contact Support')).toBeInTheDocument();
    expect(container.querySelector('a')).toHaveAttribute(
      'href',
      '/support/tickets/open?dialogOpen=true'
    );
  });
});
