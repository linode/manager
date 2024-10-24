import React from 'react';

import { imageFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ImageOption } from './ImageOption';

describe('ImageOption', () => {
  it('renders the image label', () => {
    const image = imageFactory.build({ eol: null });

    const { getByText } = renderWithTheme(
      <ImageOption image={image} isSelected={false} listItemProps={{}} />
    );

    expect(getByText(image.label)).toBeVisible();
  });
  it('renders an OS icon', () => {
    const image = imageFactory.build();

    const { getByTestId } = renderWithTheme(
      <ImageOption image={image} isSelected={false} listItemProps={{}} />
    );

    expect(getByTestId('os-icon')).toBeVisible();
  });
  it('renders a metadata (cloud-init) icon if the flag is on and the image supports cloud-init', () => {
    const image = imageFactory.build({ capabilities: ['cloud-init'] });

    const { getByLabelText } = renderWithTheme(
      <ImageOption image={image} isSelected={false} listItemProps={{}} />,
      { flags: { metadata: true } }
    );

    expect(
      getByLabelText('This image supports our Metadata service via cloud-init.')
    ).toBeVisible();
  });
  it('renders a distributed icon if image has the "distributed-sites" capability', () => {
    const image = imageFactory.build({ capabilities: ['distributed-sites'] });

    const { getByLabelText } = renderWithTheme(
      <ImageOption image={image} isSelected={false} listItemProps={{}} />
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
      <ImageOption image={image} isSelected={false} listItemProps={{}} />
    );

    expect(getByText(`${image.label} (deprecated)`)).toBeVisible();
  });

  it('renders (deprecated) if the image is past its end-of-life', () => {
    const image = imageFactory.build({
      deprecated: false,
      eol: '2015-01-01T00:00:00',
    });

    const { getByText } = renderWithTheme(
      <ImageOption image={image} isSelected={false} listItemProps={{}} />
    );

    expect(getByText(`${image.label} (deprecated)`)).toBeVisible();
  });
});
