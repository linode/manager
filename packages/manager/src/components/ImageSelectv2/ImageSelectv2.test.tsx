import userEvent from '@testing-library/user-event';
import { Settings } from 'luxon';
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
    const images = imageFactory.buildList(5, { eol: null });

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
    const image = imageFactory.build({ eol: null });
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

    expect(onChange).toHaveBeenCalledWith(image);
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

  it('should render an OS icon for the selected Image', async () => {
    const image = imageFactory.build();

    server.use(
      http.get('*/v4/images', () => {
        return HttpResponse.json(makeResourcePage([image]));
      })
    );

    const { findByTestId } = renderWithTheme(
      <ImageSelectv2 value={image.id} />
    );

    await findByTestId('os-icon');
  });

  it('does not render images that are more than 6 months past their eol', async () => {
    // Mock the current date
    Settings.now = () => new Date(2018, 1, 1).valueOf();

    const images = [
      imageFactory.build({
        eol: '2018-04-01T00:00:00', // should show because this image is not EOL yet
        label: 'linode/image-1',
      }),
      imageFactory.build({
        eol: '2017-01-01T00:00:00', // should not show because it is > 6 months past this EOL
        label: 'linode/image-2',
      }),
      imageFactory.build({
        eol: null, // should show because this images does not have an EOL
        label: 'linode/image-3',
      }),
      imageFactory.build({
        eol: '2017-11-01T00:00:00', // should show as deprecated because it is < 6 months past this EOL
        label: 'linode/image-4',
      }),
    ];

    server.use(
      http.get('*/v4/images', () => {
        return HttpResponse.json(makeResourcePage(images));
      })
    );

    const { getByPlaceholderText, getByText, queryByText } = renderWithTheme(
      <ImageSelectv2 value={null} />
    );

    await userEvent.click(getByPlaceholderText('Choose an image'));

    expect(getByText('linode/image-1')).toBeVisible();
    expect(queryByText('linode/image-2')).toBeNull();
    expect(getByText('linode/image-3')).toBeVisible();
    expect(getByText('linode/image-4 (deprecated)')).toBeVisible();
  });
});
