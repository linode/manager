import { fireEvent, screen } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { TextFieldHelperText } from './TextFieldHelperText';

const LINK_TEXT = 'endpoint types';
const URL = '/path/to/endpoint-types';
const TEXT_BEFORE = 'Understand';
const TEXT_AFTER = 'for better performance.';

describe('TextFieldHelperText', () => {
  test('renders the component with textBefore, link, and textAfter', () => {
    const handleClick = vi.fn();

    renderWithTheme(
      <TextFieldHelperText
        content={[
          TEXT_BEFORE + ' ',
          { onClick: handleClick, text: LINK_TEXT, to: URL },
          ' ' + TEXT_AFTER,
        ]}
      />
    );

    expect(screen.getByText(TEXT_BEFORE, { exact: false })).toBeInTheDocument();

    const linkElement = screen.getByText(LINK_TEXT);

    expect(linkElement).toBeInTheDocument();
    expect(linkElement.closest('a')).toHaveAttribute('href', URL);
    expect(screen.getByText(TEXT_AFTER, { exact: false })).toBeInTheDocument();

    fireEvent.click(linkElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('renders the component with link and textAfter', () => {
    const handleClick = vi.fn();

    renderWithTheme(
      <TextFieldHelperText
        content={[
          { onClick: handleClick, text: LINK_TEXT, to: URL },
          ' ' + TEXT_AFTER,
        ]}
      />
    );

    const linkElement = screen.getByText(LINK_TEXT);

    expect(linkElement).toBeInTheDocument();
    expect(linkElement.closest('a')).toHaveAttribute('href', URL);
    expect(screen.getByText(TEXT_AFTER, { exact: false })).toBeInTheDocument();

    fireEvent.click(linkElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('renders the component with only link', () => {
    const handleClick = vi.fn();

    renderWithTheme(
      <TextFieldHelperText
        content={[{ onClick: handleClick, text: LINK_TEXT, to: URL }]}
      />
    );

    const linkElement = screen.getByText(LINK_TEXT);

    expect(linkElement).toBeInTheDocument();
    expect(linkElement.closest('a')).toHaveAttribute('href', URL);

    fireEvent.click(linkElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('renders multiple links', () => {
    const handleClick1 = vi.fn();
    const handleClick2 = vi.fn();

    renderWithTheme(
      <TextFieldHelperText
        content={[
          'Text before ',
          { onClick: handleClick1, text: 'Link 1', to: '/link1' },
          ' text between ',
          { onClick: handleClick2, text: 'Link 2', to: '/link2' },
          ' text after',
        ]}
      />
    );

    const link1 = screen.getByText('Link 1');
    const link2 = screen.getByText('Link 2');

    expect(link1).toBeInTheDocument();
    expect(link2).toBeInTheDocument();
    expect(link1.closest('a')).toHaveAttribute('href', '/link1');
    expect(link2.closest('a')).toHaveAttribute('href', '/link2');

    fireEvent.click(link1);
    expect(handleClick1).toHaveBeenCalledTimes(1);

    fireEvent.click(link2);
    expect(handleClick2).toHaveBeenCalledTimes(1);
  });
});
