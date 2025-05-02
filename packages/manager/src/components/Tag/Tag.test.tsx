import { fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Tag } from './Tag';

import type { TagProps } from './Tag';

describe('Tag Component', () => {
  const defaultProps: TagProps = {
    colorVariant: 'lightBlue',
    label: 'Test Label',
  };

  it('renders correctly with required props', () => {
    const { getByRole, getByText } = renderWithTheme(<Tag {...defaultProps} />);
    const tagElement = getByText('Test Label');
    const searchButton = getByRole('button');

    expect(tagElement).toBeInTheDocument();
    expect(searchButton).toHaveAttribute(
      'aria-label',
      `Search for Tag 'Test Label'`
    );
  });

  it('truncates the label if maxLength is provided', () => {
    const { getByText } = renderWithTheme(
      <Tag {...defaultProps} label="Long Label" maxLength={5} />
    );
    const tagElement = getByText('Lo...');
    expect(tagElement).toBeInTheDocument();
  });

  it('calls closeMenu when clicked', () => {
    const closeMenuMock = vi.fn();

    const { getByText } = renderWithTheme(
      <Tag {...defaultProps} closeMenu={closeMenuMock} />
    );

    const tagElement = getByText('Test Label');
    fireEvent.click(tagElement);

    expect(closeMenuMock).toHaveBeenCalled();
  });
});
