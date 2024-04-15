import userEvent from '@testing-library/user-event';
import React from 'react';

import { imageFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ImageSelectv2 } from './ImageSelectv2';

describe('ImageSelectv2', () => {
  it('should render a default "Images" label', () => {
    const { getByLabelText } = renderWithTheme(<ImageSelectv2 value={null} />);

    expect(getByLabelText('Images')).toBeVisible();
  });

  it('should render default placeholder text', () => {
    const { getByPlaceholderText } = renderWithTheme(
      <ImageSelectv2 value={null} />
    );

    expect(getByPlaceholderText('Choose an image')).toBeVisible();
  });

  it('should render items returned by the API', async () => {
    const images = imageFactory.buildList(5);

    server.use(
      http.get('*/v4/images', () => {
        return HttpResponse.json(makeResourcePage(images));
      })
    );

    const { getByPlaceholderText, getByText } = renderWithTheme(
      <ImageSelectv2 value={null} />
    );

    await userEvent.click(getByPlaceholderText('Choose an image'));

    for (const image of images) {
      expect(getByText(image.label)).toBeVisible();
    }
  });

  it('should call onChange when a value is selected', async () => {
    const image = imageFactory.build();
    const onChange = vi.fn();

    server.use(
      http.get('*/v4/images', () => {
        return HttpResponse.json(makeResourcePage([image]));
      })
    );

    const { getByPlaceholderText, getByText } = renderWithTheme(
      <ImageSelectv2 onChange={onChange} value={null} />
    );

    await userEvent.click(getByPlaceholderText('Choose an image'));

    const imageOption = getByText(image.label);

    expect(imageOption).toBeVisible();

    await userEvent.click(imageOption);

    expect(onChange).toHaveBeenCalledWith(
      expect.anything(),
      image,
      'selectOption',
      expect.anything()
    );
  });

  it('should correctly initialize with a default value', async () => {
    const image = imageFactory.build();

    server.use(
      http.get('*/v4/images', () => {
        return HttpResponse.json(makeResourcePage([image]));
      })
    );

    const { findByDisplayValue } = renderWithTheme(
      <ImageSelectv2 value={image.id} />
    );

    await findByDisplayValue(image.label);
  });
});
