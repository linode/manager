import React from 'react';

import { imageFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ImageOptionv2 } from './ImageOptionv2';

describe('ImageOptionv2', () => {
  it('renders the image label', () => {
    const image = imageFactory.build();

    const { getByText } = renderWithTheme(
      <ImageOptionv2 image={image} isSelected={false} listItemProps={{}} />
    );

    expect(getByText(image.label)).toBeVisible();
  });
  it('renders a distribution icon', () => {
    const image = imageFactory.build();

    const { getByTestId } = renderWithTheme(
      <ImageOptionv2 image={image} isSelected={false} listItemProps={{}} />
    );

    expect(getByTestId('distro-icon')).toBeVisible();
  });
  it('renders a metadata (cloud-init) icon if the flag is on and the image supports cloud-init', () => {
    const image = imageFactory.build({ capabilities: ['cloud-init'] });

    const { getByLabelText } = renderWithTheme(
      <ImageOptionv2 image={image} isSelected={false} listItemProps={{}} />,
      { flags: { metadata: true } }
    );

    expect(
      getByLabelText('This image is compatible with cloud-init.')
    ).toBeVisible();
  });
});
