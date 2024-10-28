import React from 'react';

import { imageFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ImageOptionv2 } from './ImageOptionv2';

describe('ImageOptionv2', () => {
  it('renders the image label', () => {
    const image = imageFactory.build({ eol: null });

    const { getByText } = renderWithTheme(
      <ImageOptionv2 image={image} isSelected={false} listItemProps={{}} />
    );

    expect(getByText(image.label)).toBeVisible();
  });
  it('renders an OS icon', () => {
    const image = imageFactory.build();

    const { getByTestId } = renderWithTheme(
      <ImageOptionv2 image={image} isSelected={false} listItemProps={{}} />
    );

    expect(getByTestId('os-icon')).toBeVisible();
  });
  it('renders a metadata (cloud-init) icon if the flag is on and the image supports cloud-init', () => {
    const image = imageFactory.build({ capabilities: ['cloud-init'] });

    const { getByLabelText } = renderWithTheme(
      <ImageOptionv2 image={image} isSelected={false} listItemProps={{}} />,
      { flags: { metadata: true } }
    );

    expect(
      getByLabelText('This image supports our Metadata service via cloud-init.')
    ).toBeVisible();
  });
  it('renders a distributed icon if image has the "distributed-sites" capability', () => {
    const image = imageFactory.build({ capabilities: ['distributed-sites'] });

    const { getByLabelText } = renderWithTheme(
      <ImageOptionv2 image={image} isSelected={false} listItemProps={{}} />
    );

    expect(
      getByLabelText(
        'This image is compatible with distributed compute regions.'
      )
    ).toBeVisible();
  });

  it('renders (deprecated) if the image is deprecated', () => {
    const image = imageFactory.build({ deprecated: true });

    const { getByText } = renderWithTheme(
      <ImageOptionv2 image={image} isSelected={false} listItemProps={{}} />
    );

    expect(getByText(`${image.label} (deprecated)`)).toBeVisible();
  });

  it('renders (deprecated) if the image is past its end-of-life', () => {
    const image = imageFactory.build({
      deprecated: false,
      eol: '2015-01-01T00:00:00',
    });

    const { getByText } = renderWithTheme(
      <ImageOptionv2 image={image} isSelected={false} listItemProps={{}} />
    );

    expect(getByText(`${image.label} (deprecated)`)).toBeVisible();
  });
});
