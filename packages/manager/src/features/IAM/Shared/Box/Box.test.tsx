import { screen } from '@testing-library/react';
import * as React from 'react';

import { renderWithProviders } from '../../utilities/testHelpers';
import { Box } from './Box';

describe('Box', () => {
  it('renders children', () => {
    renderWithProviders(
      <Box>
        <span>first</span>
        <span>second</span>
      </Box>
    );

    expect(screen.getByText('first')).toBeInTheDocument();
    expect(screen.getByText('second')).toBeInTheDocument();
  });

  it('applies flex-direction: column by default', () => {
    const { container } = renderWithProviders(
      <Box>
        <span>child</span>
      </Box>
    );

    expect(container.firstChild).toHaveStyle({ flexDirection: 'column' });
  });

  it('applies the given direction', () => {
    const { container } = renderWithProviders(
      <Box direction="row">
        <span>child</span>
      </Box>
    );

    expect(container.firstChild).toHaveStyle({ flexDirection: 'row' });
  });

  describe('responsive direction (xs breakpoint)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 0,
      });
    });

    afterEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 1024,
      });
    });

    it('applies the first breakpoint value when direction is an array', () => {
      const { container } = renderWithProviders(
        <Box direction={['column', 'row']}>
          <span>child</span>
        </Box>
      );

      expect(container.firstChild).toHaveStyle({ flexDirection: 'column' });
    });

    it('applies the xs value when direction is an object', () => {
      const { container } = renderWithProviders(
        <Box direction={{ xs: 'column-reverse', sm: 'row' }}>
          <span>child</span>
        </Box>
      );

      expect(container.firstChild).toHaveStyle({
        flexDirection: 'column-reverse',
      });
    });
  });

  it('applies gap for row direction spacing when wrapping (default)', () => {
    const { container } = renderWithProviders(
      <Box direction="row" spacing={2}>
        <span>a</span>
        <span>b</span>
      </Box>
    );

    // wrap defaults to 'wrap', so gap is used on both axes → 2 * 8px = 16px
    expect(container.firstChild).toHaveStyle({ gap: '16px' });
  });

  it('applies only column-gap for row direction when wrap is nowrap', () => {
    const { container } = renderWithProviders(
      <Box direction="row" spacing={2} wrap="nowrap">
        <span>a</span>
        <span>b</span>
      </Box>
    );

    expect(container.firstChild).toHaveStyle({ columnGap: '16px' });
  });

  it('applies gap for column direction spacing', () => {
    const { container } = renderWithProviders(
      <Box spacing={1}>
        <span>a</span>
        <span>b</span>
      </Box>
    );

    // spacing={1} → 8px
    expect(container.firstChild).toHaveStyle({ gap: '8px' });
  });

  it('applies gap for row direction with a string spacing value when wrapping', () => {
    const { container } = renderWithProviders(
      <Box direction="row" spacing="1rem">
        <span>a</span>
        <span>b</span>
      </Box>
    );

    expect(container.firstChild).toHaveStyle({ gap: '1rem' });
  });

  it('renders as a custom component', () => {
    const { container } = renderWithProviders(
      <Box component="section">
        <span>child</span>
      </Box>
    );

    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('applies sx styles', () => {
    renderWithProviders(
      <Box
        direction="column"
        style={{ justifyContent: 'space-between', paddingBottom: '20px' }}
      >
        <span>child</span>
      </Box>
    );

    // Find the Box via its child — container.firstChild may be a router wrapper
    const box = screen.getByText('child').parentElement;
    expect(box).toHaveStyle({
      justifyContent: 'space-between',
      paddingBottom: '20px',
    });
  });

  it('does not apply gap when spacing is 0', () => {
    const { container } = renderWithProviders(
      <Box spacing={0}>
        <span>a</span>
      </Box>
    );

    expect(container.firstChild).not.toHaveStyle({ gap: expect.anything() });
  });

  it('applies a custom className to the root element', () => {
    const { container } = renderWithProviders(
      <Box className="my-custom-class">
        <span>child</span>
      </Box>
    );

    expect(container.firstChild).toHaveClass('my-custom-class');
  });

  it('merges a custom className with the internal box class', () => {
    const { container } = renderWithProviders(
      <Box className="extra-class" style={{ paddingBottom: '20px' }}>
        <span>child</span>
      </Box>
    );

    expect(container.firstChild).toHaveClass('extra-class');
    expect(container.firstChild).toHaveStyle({
      paddingBottom: '20px',
    });
  });
});
