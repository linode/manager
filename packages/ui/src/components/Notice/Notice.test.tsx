import { fireEvent, render } from '@testing-library/react';
import React from 'react';

import { Notice } from './Notice';
import { expect, describe, it, vi } from 'vitest';

describe('Notice Component', () => {
  it('renders without errors with proper spacing', () => {
    const { container } = render(<Notice />);
    const notice = container.firstChild;

    expect(notice).toHaveStyle('margin-bottom: 24px');
    expect(notice).toHaveStyle('margin-left: 0');
    expect(notice).toHaveStyle('margin-top: 0');
  });

  it('renders with text', () => {
    const { getByText } = render(<Notice text="This is a notice" />);
    const noticeText = getByText('This is a notice');

    expect(noticeText).toBeInTheDocument();
  });

  it('renders with children', () => {
    const { getByText } = render(<Notice>This is a notice</Notice>);
    const noticeText = getByText('This is a notice');

    expect(noticeText).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    const { getByText } = render(
      <Notice onClick={handleClick} text="Click me" />
    );
    const noticeText = getByText('Click me');
    fireEvent.click(noticeText);

    expect(handleClick).toHaveBeenCalled();
  });

  it('applies className prop', () => {
    const { container } = render(<Notice className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('applies dataTestId props', () => {
    const { getByTestId } = render(
      <Notice dataTestId="test-id" variant="success" />
    );

    expect(getByTestId('notice-success')).toBeInTheDocument();
    expect(getByTestId('test-id')).toBeInTheDocument();
  });

  it('applies variant prop', () => {
    const { container } = render(<Notice variant="error" />);

    expect(container.firstChild).toHaveStyle('border-left: 5px solid #d63c42;');
  });

  it('displays icon for important notices', () => {
    const { getByTestId } = render(<Notice important />);
    const icon = getByTestId('notice-important');

    expect(icon).toBeInTheDocument();
  });

  it('handles bypassValidation prop', () => {
    const { container } = render(<Notice bypassValidation />);

    expect(container.firstChild).not.toHaveClass('error-for-scroll');
  });

  it('applies spacing props', () => {
    const { container } = render(
      <Notice spacingBottom={8} spacingLeft={4} spacingTop={4} />
    );
    const notice = container.firstChild;

    expect(notice).toHaveStyle('margin-bottom: 8px');
    expect(notice).toHaveStyle('margin-left: 4px');
    expect(notice).toHaveStyle('margin-top: 4px');
  });

  it('applies typeProps to Typography component', () => {
    const { container } = render(
      <Notice
        text="Styled Text"
        typeProps={{ style: { fontFamily: 'monospace' } }}
      />
    );
    const typography = container.querySelector('.noticeText');

    expect(typography).toHaveStyle('font-family: monospace');
  });
});
