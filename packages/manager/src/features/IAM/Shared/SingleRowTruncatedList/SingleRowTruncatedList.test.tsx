import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithProviders } from '../../utilities/testHelpers';
import { SingleRowTruncatedList } from './SingleRowTruncatedList';

const getVisibleEllipsis = (container: HTMLElement) =>
  container.querySelector('[data-slrtl-visible-ellipsis]');

const makeItems = (count: number) =>
  Array.from({ length: count }, (_, i) => (
    <span key={i}>{`Item ${i + 1}`}</span>
  ));

const overflowButtonPhantom = <button>+99</button>;

const renderOverflowButton = (hiddenCount: number) => (
  <button>{`+${hiddenCount}`}</button>
);

describe('SingleRowTruncatedList', () => {
  it('renders all items in the DOM', () => {
    renderWithProviders(
      <SingleRowTruncatedList
        items={makeItems(3)}
        overflowButtonPhantom={overflowButtonPhantom}
        renderOverflowButton={renderOverflowButton}
      />
    );

    expect(screen.getByText('Item 1')).toBeVisible();
    expect(screen.getByText('Item 2')).toBeVisible();
    expect(screen.getByText('Item 3')).toBeVisible();
  });

  it('does not show the overflow pill when all items fit and totalCount is not set', () => {
    const { container } = renderWithProviders(
      <SingleRowTruncatedList
        items={makeItems(3)}
        overflowButtonPhantom={overflowButtonPhantom}
        renderOverflowButton={renderOverflowButton}
      />
    );

    // No +N pill and no visible ellipsis (phantom may still hold a hidden measure node)
    expect(screen.queryByRole('button', { name: /^\+\d+$/ })).toBeNull();
    expect(getVisibleEllipsis(container)).toBeNull();
  });

  it('shows the overflow pill and ellipsis when totalCount exceeds items.length', () => {
    const { container } = renderWithProviders(
      <SingleRowTruncatedList
        items={makeItems(5)}
        overflowButtonPhantom={overflowButtonPhantom}
        renderOverflowButton={renderOverflowButton}
        totalCount={20}
      />
    );

    // hiddenFromCap = 20 - 5 = 15
    expect(screen.getByRole('button', { name: '+15' })).toBeVisible();
    expect(getVisibleEllipsis(container)).toHaveTextContent('...');
  });

  it('passes the correct hidden count to renderOverflowButton', () => {
    const mockRenderOverflowButton = vi.fn((count: number) => (
      <button>{`+${count}`}</button>
    ));

    renderWithProviders(
      <SingleRowTruncatedList
        items={makeItems(3)}
        overflowButtonPhantom={overflowButtonPhantom}
        renderOverflowButton={mockRenderOverflowButton}
        totalCount={10}
      />
    );

    // hiddenFromCap = 10 - 3 = 7
    expect(mockRenderOverflowButton).toHaveBeenCalledWith(7);
  });

  it('renders the phantom element as aria-hidden for overflow pill measurement', () => {
    renderWithProviders(
      <SingleRowTruncatedList
        items={makeItems(3)}
        overflowButtonPhantom={<button>+99</button>}
        renderOverflowButton={renderOverflowButton}
      />
    );

    // The phantom +99 button must exist in DOM but be aria-hidden
    const phantom = screen.getByText('+99').closest('[aria-hidden]');
    expect(phantom).toBeInTheDocument();
  });

  it('shows the overflow pill and ellipsis when layout truncation occurs', () => {
    // Patch clientWidth/offsetWidth on HTMLElement.prototype before mounting so
    // useLayoutEffect sees real-ish layout values.  Each item is 40px, the container
    // is 100px, so even the first item + overflow pill (40px phantom) exceeds available
    // width → visibleCount lands at 0, overflow pill shows "+10".
    const clientWidthDescriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'clientWidth'
    );
    const offsetWidthDescriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'offsetWidth'
    );

    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get: () => 100,
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get: () => 40,
    });

    const { container } = renderWithProviders(
      <SingleRowTruncatedList
        gapPx={8}
        items={makeItems(10)}
        overflowButtonPhantom={overflowButtonPhantom}
        renderOverflowButton={renderOverflowButton}
      />
    );

    // Restore originals
    if (clientWidthDescriptor) {
      Object.defineProperty(
        HTMLElement.prototype,
        'clientWidth',
        clientWidthDescriptor
      );
    }
    if (offsetWidthDescriptor) {
      Object.defineProperty(
        HTMLElement.prototype,
        'offsetWidth',
        offsetWidthDescriptor
      );
    }

    expect(getVisibleEllipsis(container)).toHaveTextContent('...');
    expect(screen.getByRole('button', { name: '+10' })).toBeVisible();
  });
});
