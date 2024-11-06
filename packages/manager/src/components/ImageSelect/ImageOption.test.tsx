import React from 'react';

import { imageFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ImageOption } from './ImageOption';

describe('ImageOption', () => {
  it('renders the image label', () => {
    const image = imageFactory.build({ eol: null });

    const { getByText } = renderWithTheme(
      <ImageOption item={image} props={{}} selected={false} />
    );

    expect(getByText(image.label)).toBeVisible();
  });

  it('renders an OS icon', () => {
    const image = imageFactory.build();

    const { getByTestId } = renderWithTheme(
      <ImageOption item={image} props={{}} selected={false} />
    );

    expect(getByTestId('os-icon')).toBeVisible();
  });

  it('renders a metadata (cloud-init) icon if the flag is on and the image supports cloud-init', () => {
    const image = imageFactory.build({ capabilities: ['cloud-init'] });

    const { getByLabelText } = renderWithTheme(
      <ImageOption item={image} props={{}} selected={false} />,
      { flags: { metadata: true } }
    );

    expect(
      getByLabelText('This image supports our Metadata service via cloud-init.')
    ).toBeVisible();
  });

  it('disables the image option if the image has a disabled reason', () => {
    const image = imageFactory.build({ eol: null });
    const disabledReason =
      'The selected image cannot be deployed to a distributed region.';

    const { getByText } = renderWithTheme(
      <ImageOption
        disabledOptions={{ reason: disabledReason }}
        item={image}
        props={{}}
        selected={false}
      />
    );
    expect(
      getByText(image.label).closest('li')?.getAttribute('aria-label')
    ).toBe(disabledReason);
  });

  it('does not disable the image option if the image does not have a disabled reason', () => {
    const image = imageFactory.build({ eol: null });

    const { getByText } = renderWithTheme(
      <ImageOption item={image} props={{}} selected={false} />
    );
    expect(
      getByText(image.label).closest('li')?.getAttribute('aria-label')
    ).toBe('');
  });

  it('renders (deprecated) if the image is deprecated', () => {
    const image = imageFactory.build({ deprecated: true });

    const { getByText } = renderWithTheme(
      <ImageOption item={image} props={{}} selected={false} />
    );

    expect(getByText(`${image.label} (deprecated)`)).toBeVisible();
  });

  it('renders (deprecated) if the image is past its end-of-life', () => {
    const image = imageFactory.build({
      deprecated: false,
      eol: '2015-01-01T00:00:00',
    });

    const { getByText } = renderWithTheme(
      <ImageOption item={image} props={{}} selected={false} />
    );

    expect(getByText(`${image.label} (deprecated)`)).toBeVisible();
  });

  it('should show the selected icon when isSelected is true', () => {
    const image = imageFactory.build();

    const { getByTestId } = renderWithTheme(
      <ImageOption item={image} props={{}} selected={true} />
    );

    expect(getByTestId('DoneIcon')).toBeVisible();
  });
});
