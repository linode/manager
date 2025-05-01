import { fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Tile } from './Tile'; // Assuming the Tile component is in the same directory

import type { TileProps } from './Tile';

describe('Tile Component', () => {
  const defaultProps: TileProps = {
    title: 'Test Tile',
  };

  it('renders title correctly', () => {
    const { getByText } = renderWithTheme(<Tile {...defaultProps} />);

    expect(getByText('Test Tile')).toBeInTheDocument();
  });

  it('calls onClick function when tile is clicked', () => {
    const onClickMock = vi.fn();
    const { getByRole } = renderWithTheme(
      <Tile {...defaultProps} link={onClickMock} />
    );

    fireEvent.click(getByRole('link'));

    expect(onClickMock).toHaveBeenCalled();
  });

  it('renders error notice when errorText is provided', () => {
    const { getByText } = renderWithTheme(
      <Tile {...defaultProps} errorText="Error Message" />
    );

    expect(getByText('Error Message')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    const { getByText } = renderWithTheme(
      <Tile {...defaultProps} description="This is a test description" />
    );

    expect(getByText('This is a test description')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const { getByTestId } = renderWithTheme(
      <Tile {...defaultProps} icon={<svg data-testid="test-icon" />} />
    );

    expect(getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders link as a Button when link is a function', () => {
    const onClickMock = vi.fn();
    const { getByRole } = renderWithTheme(
      <Tile {...defaultProps} link={onClickMock} />
    );
    const buttonElement = getByRole('button');

    fireEvent.click(buttonElement);

    expect(onClickMock).toHaveBeenCalled();
  });

  it('renders link as a Link when link is a string', () => {
    const { getByText } = renderWithTheme(
      <Tile {...defaultProps} link="/test" />
    );
    const linkElement = getByText('Test Tile');

    expect(linkElement.tagName).toBe('A');
  });

  it('does not render a link when link is not provided', () => {
    const { getByText } = renderWithTheme(<Tile {...defaultProps} />);
    const element = getByText('Test Tile');

    expect(element.tagName).toBe('H3');
  });
});
