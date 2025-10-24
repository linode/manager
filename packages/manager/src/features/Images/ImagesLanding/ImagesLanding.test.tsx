import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ImagesLanding } from './ImagesLanding';

const queryMocks = vi.hoisted(() => ({
  useFlags: vi.fn().mockReturnValue({ privateImageSharing: false }),
}));

vi.mock('src/hooks/useFlags', () => ({
  useFlags: queryMocks.useFlags,
}));

// Mock ImagesLandingTable component so it doesn't lazy load in tests
vi.mock('./ImagesLandingTable', () => ({
  ImagesLandingTable: () => <div>ImagesLandingTable Component</div>,
}));

describe('ImagesLanding', () => {
  it("should render Images tab always and hides Share Groups tab if 'privateImageSharing' feature flag is false", () => {
    queryMocks.useFlags.mockReturnValue({ privateImageSharing: false });

    const { queryByRole, getByRole } = renderWithTheme(<ImagesLanding />, {
      initialRoute: '/images',
    });

    expect(getByRole('tab', { name: /images/i })).toBeVisible();
    expect(queryByRole('tab', { name: /share groups/i })).toBeNull();
  });

  it('should render Share Groups tab when privateImageSharing feature flag is true', () => {
    queryMocks.useFlags.mockReturnValue({ privateImageSharing: true });

    const { getByRole } = renderWithTheme(<ImagesLanding />, {
      initialRoute: '/images',
    });

    expect(getByRole('tab', { name: /images/i })).toBeVisible();
    expect(getByRole('tab', { name: /share groups/i })).toBeVisible();
  });

  it('should render ImagesLandingTable component in the Images tab panel', () => {
    const { getByText } = renderWithTheme(<ImagesLanding />, {
      initialRoute: '/images',
    });

    expect(getByText('ImagesLandingTable Component')).toBeVisible();
  });
});
