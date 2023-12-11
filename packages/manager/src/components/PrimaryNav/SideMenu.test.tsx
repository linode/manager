import '@testing-library/jest-dom';
import { fireEvent, screen } from '@testing-library/react';
import React from 'react';

import { breakpoints } from 'src/foundations/breakpoints';
import { renderWithTheme, resizeScreenSize } from 'src/utilities/testHelpers';

import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH, SideMenu } from './SideMenu';

// Mock PrimaryNav component
vi.mock('./PrimaryNav', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked PrimaryNav</div>,
  };
});

const closeMenuMock = vi.fn();

describe('SideMenu Component', () => {
  it('renders without crashing', () => {
    renderWithTheme(
      <SideMenu closeMenu={closeMenuMock} collapse={false} open={true} />
    );

    expect(screen.getByText('Mocked PrimaryNav')).toBeInTheDocument();
  });

  it('renders expanded menu (desktop)', () => {
    renderWithTheme(
      <SideMenu closeMenu={closeMenuMock} collapse={false} open={true} />
    );

    const drawerPaper = screen.getByTestId('side-menu');

    vi.waitFor(() => {
      expect(drawerPaper.firstChild).toHaveStyle(`width: ${SIDEBAR_WIDTH}px`);
    });
  });

  it('renders collapsed menu (desktop)', () => {
    renderWithTheme(
      <SideMenu closeMenu={closeMenuMock} collapse={true} open={true} />
    );

    const drawerPaper = screen.getByTestId('side-menu');

    vi.waitFor(() => {
      expect(drawerPaper.firstChild).toHaveStyle(
        `width: ${SIDEBAR_COLLAPSED_WIDTH}px`
      );
    });
  });

  it('expands collapsed menu on hover (desktop)', async () => {
    renderWithTheme(
      <SideMenu closeMenu={closeMenuMock} collapse={true} open={true} />
    );
    const drawerPaper = screen.getByTestId('side-menu');

    fireEvent.mouseEnter(drawerPaper);

    vi.waitFor(() => {
      expect(drawerPaper.firstChild).toHaveStyle(`width: ${SIDEBAR_WIDTH}px`);
    });
  });

  it('handles open state on mobile', () => {
    resizeScreenSize(breakpoints.values.sm);

    renderWithTheme(
      <SideMenu closeMenu={closeMenuMock} collapse={false} open={true} />
    );

    const drawerPaper = screen.getByTestId('side-menu-mobile');

    vi.waitFor(() => {
      expect(drawerPaper.firstChild).toHaveStyle(`width: ${SIDEBAR_WIDTH}px`);
    });
  });

  it('handles close state on mobile', () => {
    resizeScreenSize(breakpoints.values.sm);

    renderWithTheme(
      <SideMenu closeMenu={closeMenuMock} collapse={false} open={false} />
    );

    const drawerPaper = screen.getByTestId('side-menu-mobile');

    vi.waitFor(() => {
      expect(drawerPaper.firstChild).toHaveStyle(`width: ${0}px`);
    });
  });
});
