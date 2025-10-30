import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ImagesLandingV2 } from './ImagesLandingV2';

const queryMocks = vi.hoisted(() => ({
  useFlags: vi.fn().mockReturnValue({ privateImageSharing: false }),
}));

vi.mock('src/hooks/useFlags', () => ({
  useFlags: queryMocks.useFlags,
}));

// Mock ImagesTabContainer component so it doesn't lazy load in tests
vi.mock('./ImagesTabContainer', () => ({
  ImagesTabContainer: () => <div>ImagesTabContainer Component</div>,
}));

describe('ImagesLandingV2', () => {
  it("should render Images tab always and hides Share Groups tab if 'privateImageSharing' feature flag is false", () => {
    queryMocks.useFlags.mockReturnValue({ privateImageSharing: false });

    const { queryByRole, getByRole } = renderWithTheme(<ImagesLandingV2 />, {
      initialRoute: '/images',
    });

    expect(getByRole('tab', { name: /images/i })).toBeVisible();
    expect(queryByRole('tab', { name: /share groups/i })).toBeNull();
  });

  it('should render Share Groups tab when privateImageSharing feature flag is true', () => {
    queryMocks.useFlags.mockReturnValue({ privateImageSharing: true });

    const { getByRole } = renderWithTheme(<ImagesLandingV2 />, {
      initialRoute: '/images',
    });

    expect(getByRole('tab', { name: /images/i })).toBeVisible();
    expect(getByRole('tab', { name: /share groups/i })).toBeVisible();
  });

  it('should render ImagesTabContainer component in the Images tab panel', () => {
    const { getByText } = renderWithTheme(<ImagesLandingV2 />, {
      initialRoute: '/images',
    });

    expect(getByText('ImagesTabContainer Component')).toBeVisible();
  });
});
