import userEvent from '@testing-library/user-event';
import React from 'react';

import DocsIcon from 'src/assets/icons/docs.svg';
import { Link } from 'src/components/Link';
import { renderWithTheme } from 'src/utilities/testHelpers';

import type { LinkProps } from 'src/components/Link';

describe('Link component', () => {
  it('renders an internal link when "external" prop is not provided', () => {
    const mockProps: LinkProps = {
      children: 'Internal Link',
      to: '/internal',
    };

    const { getByTestId } = renderWithTheme(<Link {...mockProps} />);
    const linkElement = getByTestId('internal-link');

    expect(linkElement).toBeInTheDocument();
    expect(linkElement.tagName).toBe('A');
    expect(linkElement.getAttribute('href')).toBe('/internal');
    expect(linkElement).toHaveTextContent(/Internal Link/);
  });

  it('renders an external link when "external" prop is true', () => {
    const mockProps: LinkProps = {
      children: 'External Link',
      external: true,
      to: 'https://example.com',
    };

    const { getByTestId } = renderWithTheme(<Link {...mockProps} />);
    const linkElement = getByTestId('external-site-link');

    expect(linkElement).toBeInTheDocument();
    expect(linkElement.tagName).toBe('A');
    expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');
    expect(linkElement).toHaveAttribute('target', '_blank');
    expect(linkElement.getAttribute('href')).toBe('https://example.com/');
    expect(linkElement.getAttribute('target')).toBe('_blank');
    expect(linkElement).toHaveTextContent(/External Link/);
  });

  it('opens external links in a new tab when "external" prop is not provided', () => {
    const mockProps: LinkProps = {
      children: 'External Link',
      to: 'https://example.com',
    };

    const { getByTestId } = renderWithTheme(<Link {...mockProps} />);
    const linkElement = getByTestId('external-link');

    expect(linkElement).toBeInTheDocument();
    expect(linkElement.tagName).toBe('A');
    expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');
    expect(linkElement).toHaveAttribute('target', '_blank');
    expect(linkElement.getAttribute('href')).toBe('https://example.com/');
    expect(linkElement.getAttribute('target')).toBe('_blank');
    expect(linkElement).toHaveTextContent(/External Link/);
  });

  it('calls the onClick handler when the link is clicked', async () => {
    const mockOnClick = vi.fn();
    const mockProps: LinkProps = {
      children: 'External Link',
      external: true,
      onClick: mockOnClick,
      to: 'https://example.com',
    };

    const { getByTestId } = renderWithTheme(<Link {...mockProps} />);
    const linkElement = getByTestId('external-site-link');

    expect(linkElement).toBeInTheDocument();
    expect(linkElement.tagName).toBe('A');
    expect(linkElement).toHaveTextContent(/External Link/);

    await userEvent.click(linkElement);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('uses a custom aria label if an "accessibleAriaLabel" is passed to the component', () => {
    const mockProps: LinkProps = {
      accessibleAriaLabel: 'Accessible aria label',
      children: 'External Link',
      external: true,
      to: 'https://example.com',
    };

    const { getByTestId } = renderWithTheme(<Link {...mockProps} />);
    const linkElement = getByTestId('external-site-link');

    expect(linkElement).toBeInTheDocument();
    expect(linkElement.tagName).toBe('A');
    expect(linkElement).toHaveTextContent(/External Link/);
    expect(linkElement.getAttribute('aria-label')).toBe(
      'Accessible aria label - link opens in a new tab'
    );
  });

  it('properly flattens an array of children into an aria label', () => {
    const mockProps: LinkProps = {
      children: [
        <span key={1}>
          <DocsIcon />
        </span>,
        <span key={2}>Second child</span>,
      ],
      to: 'https://example.com',
    };

    const { getByTestId } = renderWithTheme(<Link {...mockProps} />);
    const linkElement = getByTestId('external-link');

    expect(linkElement).toBeInTheDocument();
    expect(linkElement.tagName).toBe('A');
    expect(linkElement).toHaveTextContent(/Second child/);
    expect(linkElement.getAttribute('aria-label')).toBe(
      'Second child - link opens in a new tab'
    );
  });
});
