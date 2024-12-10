import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { EntityHeader } from './EntityHeader';

import { HeaderProps } from './EntityHeader';

const mockText = 'Hello world';

const defaultProps: HeaderProps = {
  title: mockText,
};

describe('EntityHeader', () => {
  it('should render title with variant when isSummaryView is True', () => {
    const { getByRole } = renderWithTheme(
      <EntityHeader variant="h2" isSummaryView {...defaultProps} />
    );
    const heading = getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(mockText);
  });

  it('should not render title when isSummaryView is False', () => {
    const { queryByText } = renderWithTheme(
      <EntityHeader isSummaryView={false} {...defaultProps} />
    );
    expect(queryByText(mockText)).not.toBeInTheDocument();
  });

  it('should render children if provided', () => {
    const { getByText } = renderWithTheme(
      <EntityHeader {...defaultProps}>
        <div>Child items can go here!</div>
      </EntityHeader>
    );
    expect(getByText('Child items can go here!')).toBeInTheDocument();
  });
});
