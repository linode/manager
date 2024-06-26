import React from 'react';

import { imageFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ManageImageRegionsDrawer } from './ManageImageRegionsDrawer';

describe('ManageImageRegionsDrawer', () => {
  it('should not render when no image is passed via props', () => {
    const { container } = renderWithTheme(
      <ManageImageRegionsDrawer image={undefined} onClose={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should render a header', () => {
    const image = imageFactory.build();
    const { getByText } = renderWithTheme(
      <ManageImageRegionsDrawer image={image} onClose={vi.fn()} />
    );

    expect(getByText(`Manage Regions for ${image.label}`)).toBeVisible();
  });

  it('should render a header', () => {
    const image = imageFactory.build();
    const { getByText } = renderWithTheme(
      <ManageImageRegionsDrawer image={image} onClose={vi.fn()} />
    );

    expect(getByText(`Manage Regions for ${image.label}`)).toBeVisible();
  });
});
