import { fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Notice } from './Notice';

describe('Notice Component', () => {
  it('renders without errors', () => {
    renderWithTheme(<Notice />);
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
    const handleClick = jest.fn();
    const { getByText } = renderWithTheme(
      <Notice onClick={handleClick} text="Click me" />
    );
    const noticeText = getByText('Click me');
    fireEvent.click(noticeText);

    expect(handleClick).toHaveBeenCalled();
  });

  it('applies className prop', () => {
    const { container } = renderWithTheme(<Notice className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('applies dataTestId props', () => {
    const { getByTestId } = renderWithTheme(
      <Notice dataTestId="test-id" variant="success" />
    );

    expect(getByTestId('notice-success')).toBeInTheDocument();
    expect(getByTestId('test-id')).toBeInTheDocument();
  });

  it('applies variant prop', () => {
    const { container } = renderWithTheme(<Notice variant="error" />);

    expect(container.firstChild).toHaveStyle('border-left: 5px solid #ca0813;');
  });

  it('displays flag', () => {
    const { getByTestId } = renderWithTheme(<Notice flag />);

    expect(getByTestId('notice-with-flag-icon')).toBeInTheDocument();
  });

  it('displays icon for important notices', () => {
    const { getByTestId } = renderWithTheme(<Notice important />);
    const icon = getByTestId('notice-important');

    expect(icon).toBeInTheDocument();
  });

  it('handles bypassValidation prop', () => {
    const { container } = renderWithTheme(<Notice bypassValidation />);

    expect(container.firstChild).not.toHaveClass('error-for-scroll');
  });

  it('applies spacing props', () => {
    const { container } = renderWithTheme(
      <Notice spacingBottom={8} spacingLeft={4} spacingTop={4} />
    );
    const notice = container.firstChild;

    expect(notice).toHaveStyle('margin-bottom: 16px');
    expect(notice).toHaveStyle('margin-left: 32px');
    expect(notice).toHaveStyle('margin-top: 32px');
  });

  it('applies typeProps to Typography component', () => {
    const { container } = renderWithTheme(
      <Notice
        text="Styled Text"
        typeProps={{ style: { fontWeight: 'bold' } }}
      />
    );
    const typography = container.querySelector('.noticeText');

    expect(typography).toHaveStyle('font-weight: bold');
  });
});
