/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { render, screen } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { InferenceLogo } from './InferenceLogo';

describe('InferenceLogo', () => {
  describe('URL branch', () => {
    it.each([
      ['https://example.com/x.svg'],
      ['http://example.com/x.svg'],
      ['data:image/svg+xml;base64,PHN2Zy8+'],
      ['/local/path.svg'],
    ])('renders an <img> when value is a URL (%s)', (url) => {
      const { container } = render(
        <InferenceLogo alt="logo" kind="provider" value={url} />
      );
      const img = screen.getByRole('img', { name: 'logo' });
      expect(img).toHaveAttribute('src', url);
      expect(container.querySelector('svg')).toBeNull();
    });

    it('applies objectFit: contain plus caller styles', () => {
      render(
        <InferenceLogo
          alt="x"
          kind="model"
          style={{ height: 32, width: 32 }}
          value="https://example.com/x.svg"
        />
      );
      const img = screen.getByRole('img', { name: 'x' });
      expect(img).toHaveStyle({
        height: '32px',
        objectFit: 'contain',
        width: '32px',
      });
    });
  });

  describe('slug branch', () => {
    it('renders a bundled inline SVG for a known provider slug', () => {
      const { container } = renderWithTheme(
        <InferenceLogo kind="provider" value="meta" />
      );
      expect(container.querySelector('svg')).not.toBeNull();
      // No <img> element is rendered for slug values.
      expect(container.querySelector('img')).toBeNull();
    });

    it('renders a bundled inline SVG for a known model slug', () => {
      const { container } = renderWithTheme(
        <InferenceLogo kind="model" value="gemma4" />
      );
      expect(container.querySelector('svg')).not.toBeNull();
    });

    it('falls back to the default provider SVG for an unknown provider slug', () => {
      // `providerIcon` returns the Google SVG as the default for unknown slugs.
      const { container } = renderWithTheme(
        <InferenceLogo kind="provider" value="not-a-real-slug" />
      );
      expect(container.querySelector('svg')).not.toBeNull();
    });

    it('falls back to the default SVG for an unknown model slug', () => {
      // `modelIcon` also returns the Google SVG as its default.
      const { container } = renderWithTheme(
        <InferenceLogo kind="model" value="not-a-real-slug" />
      );
      expect(container.querySelector('svg')).not.toBeNull();
    });
  });

  describe('empty value', () => {
    it('renders nothing when value is undefined', () => {
      const { container } = render(
        <InferenceLogo kind="provider" value={undefined} />
      );
      expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when value is an empty string', () => {
      const { container } = render(<InferenceLogo kind="provider" value="" />);
      expect(container).toBeEmptyDOMElement();
    });
  });
});
