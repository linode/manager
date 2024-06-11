import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { EventMessage } from './EventMessage';

describe('EventMessage', () => {
  it('renders null when message is null', () => {
    const { queryByRole } = renderWithTheme(<EventMessage message={null} />);

    expect(queryByRole('pre')).toBeNull();
  });

  it('renders message without ticks as plain text', () => {
    const { getByText, queryByRole } = renderWithTheme(
      <EventMessage message="Hello, world!" />
    );

    expect(getByText('Hello, world!')).toBeInTheDocument();
    expect(queryByRole('pre')).toBeNull();
  });

  it('renders message with ticks as inline code blocks', () => {
    const { container, getByText } = renderWithTheme(
      <EventMessage message="Hello, `world`!" />
    );

    expect(getByText(/Hello,/)).toBeInTheDocument();
    expect(container.querySelector('pre')).toHaveTextContent('world');
  });
});
