import userEvent from '@testing-library/user-event';
import { Settings } from 'luxon';
import React from 'react';

import { imageFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ImageSelect } from './ImageSelect';

describe('ImageSelect', () => {
  it('should render a default "Images" label', () => {
    const { getByLabelText } = renderWithTheme(
      <ImageSelect onChange={vi.fn()} value={null} variant="public" />
    );

    expect(getByLabelText('Images')).toBeVisible();
  });

  it('should render default placeholder text', () => {
    const { getByPlaceholderText } = renderWithTheme(
      <ImageSelect onChange={vi.fn()} value={null} variant="public" />
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
      <ImageSelect onChange={vi.fn()} value={null} variant="public" />
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
      <ImageSelect onChange={onChange} value={null} variant="public" />
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
      <ImageSelect onChange={vi.fn()} value={image.id} variant="public" />
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
      <ImageSelect onChange={vi.fn()} value={image.id} variant="public" />
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
      <ImageSelect onChange={vi.fn()} value={null} variant="public" />
    );

    await userEvent.click(getByPlaceholderText('Choose an image'));

    expect(getByText('linode/image-1')).toBeVisible();
    expect(queryByText('linode/image-2')).toBeNull();
    expect(getByText('linode/image-3')).toBeVisible();
    expect(getByText('linode/image-4 (deprecated)')).toBeVisible();
  });

  it('should display an error', () => {
    const { getByText } = renderWithTheme(
      <ImageSelect
        errorText="An error"
        onChange={vi.fn()}
        value={null}
        variant="public"
      />
    );
    expect(getByText('An error')).toBeInTheDocument();
  });

  it('should handle any/all', async () => {
    const onSelect = vi.fn();

    const { getByLabelText, getByText } = renderWithTheme(
      <ImageSelect
        anyAllOption
        label="Images"
        multiple
        onChange={onSelect}
        value={[]}
        variant="public"
      />
    );

    await userEvent.click(getByLabelText('Images'));

    await userEvent.click(getByText('Any/All'));

    expect(onSelect).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'any/all' }),
    ]);
  });

  it('should sort images by vendor, then by creation date, then "My Images" first', async () => {
    const publicImages = [
      imageFactory.build({
        created: '2023-01-01T00:00:00',
        is_public: true,
        label: 'Public Image 1',
        vendor: 'CentOS',
      }),
      imageFactory.build({
        created: '2023-02-01T00:00:00',
        is_public: true,
        label: 'Public Image 2',
        vendor: 'Debian',
      }),
      imageFactory.build({
        created: '2023-03-01T00:00:00',
        is_public: true,
        label: 'Public Image 3',
        vendor: 'Ubuntu',
      }),
    ];
    const privateImages = [
      imageFactory.build({
        created: '2023-04-01T00:00:00',
        is_public: false,
        label: 'Private Image 1',
      }),
      imageFactory.build({
        created: '2023-05-01T00:00:00',
        is_public: false,
        label: 'Private Image 2',
      }),
    ];

    // The API returns private images first, then public images
    // Granted this won't change, I don't think we need to filter them client side
    // Therefore this test assumes the API initial sort order
    const images = [...privateImages, ...publicImages];

    const { getAllByRole, getByLabelText, getByText } = renderWithTheme(
      <ImageSelect
        onChange={vi.fn()}
        options={images}
        value={null}
        variant="all"
      />
    );

    await userEvent.click(getByLabelText('Images'));
    expect(getByText('My Images')).toBeInTheDocument();
    expect(getByText('CentOS')).toBeInTheDocument();
    expect(getByText('Debian')).toBeInTheDocument();
    expect(getByText('Ubuntu')).toBeInTheDocument();

    const options = getAllByRole('option');

    expect(getByText('My Images')).toBeInTheDocument();
    expect(getByText('CentOS')).toBeInTheDocument();
    expect(getByText('Debian')).toBeInTheDocument();
    expect(getByText('Ubuntu')).toBeInTheDocument();

    // Assert that private images ("My Images") come first
    expect(options[0].textContent?.trim()).toContain('Private Image 1');
    expect(options[1].textContent?.trim()).toContain('Private Image 2');

    // Assert the order of public images by vendor
    expect(options[2].textContent?.trim()).toContain('Public Image 1');
    expect(options[3].textContent?.trim()).toContain('Public Image 2');
    expect(options[4].textContent?.trim()).toContain('Public Image 3');
  });
});
