import { fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithTheme } from '../../utilities/testHelpers';
import { Notice } from './Notice';

describe('Notice Component', () => {
  it('renders without errors with proper spacing', () => {
    const { container } = renderWithTheme(<Notice />);
    const notice = container.firstChild;

    expect(notice).toHaveStyle('margin-bottom: 1rem');
    expect(notice).toHaveStyle('margin-left: 0');
    expect(notice).toHaveStyle('margin-top: 0');
  });

  it('renders with text', () => {
    const { getByText } = renderWithTheme(<Notice text="This is a notice" />);
    const noticeText = getByText('This is a notice');

    expect(noticeText).toBeInTheDocument();
  });

  it('renders with children', () => {
    const { getByText } = renderWithTheme(<Notice>This is a notice</Notice>);
    const noticeText = getByText('This is a notice');

    expect(noticeText).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    const { getByText } = renderWithTheme(
      <Notice onClick={handleClick} text="Click me" />,
    );
    const noticeText = getByText('Click me');
    fireEvent.click(noticeText);

    expect(handleClick).toHaveBeenCalled();
  });

  it('applies className prop', () => {
    const { container } = renderWithTheme(<Notice className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('applies a default test-id based on the variant', () => {
    const { getByTestId } = renderWithTheme(<Notice variant="success" />);

    expect(getByTestId('notice-success')).toBeInTheDocument();
  });

  it('applies the dataTestId prop', () => {
    const { getByTestId } = renderWithTheme(
      <Notice dataTestId="my-custom-test-id" variant="success" />,
    );

    expect(getByTestId('my-custom-test-id')).toBeInTheDocument();
  });

  it('applies variant prop', () => {
    const { container } = renderWithTheme(<Notice variant="error" />);

    expect(container.firstChild).toHaveStyle('border-left: 4px solid #d63c42;');
    expect(container.firstChild).toHaveStyle('background: #ffe5e5;');
  });

  it('handles bypassValidation prop', () => {
    const { container } = renderWithTheme(<Notice bypassValidation />);

    expect(container.firstChild).not.toHaveClass('error-for-scroll');
  });

  it('applies spacing props', () => {
    const { container } = renderWithTheme(
      <Notice spacingBottom={8} spacingLeft={4} spacingTop={4} />,
    );
    const notice = container.firstChild;

    expect(notice).toHaveStyle('margin-bottom: 8px');
    expect(notice).toHaveStyle('margin-left: 4px');
    expect(notice).toHaveStyle('margin-top: 4px');
  });

  it('applies typeProps to Typography component', () => {
    const { getByText } = renderWithTheme(
      <Notice
        text="Styled Text"
        typeProps={{ style: { fontFamily: 'monospace' } }}
      />,
    );
    const typography = getByText('Styled Text');

    expect(typography).toHaveStyle('font-family: monospace');
  });
});
