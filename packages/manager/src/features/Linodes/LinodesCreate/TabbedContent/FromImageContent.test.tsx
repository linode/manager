import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { FromImageContent } from './FromImageContent';

import type { CombinedProps } from './FromImageContent';

const mockProps: CombinedProps = {
  accountBackupsEnabled: false,
  imagesData: {},
  regionsData: [],
  typesData: [],
  updateImageID: vi.fn(),
  updateRegionID: vi.fn(),
  updateTypeID: vi.fn(),
  userCannotCreateLinode: false,
};

describe('FromImageContent', () => {
  it('should render an image select', () => {
    const { getByLabelText } = renderWithTheme(
      <FromImageContent {...mockProps} />
    );

    expect(getByLabelText('Images')).toBeVisible();
  });

  it('should render empty state if user has no images and variant is private', () => {
    const { getByText } = renderWithTheme(
      <FromImageContent {...mockProps} variant="private" />
    );

    expect(
      getByText('You don’t have any private Images.', { exact: false })
    ).toBeVisible();
  });
});
