import React from 'react';
import ImageSelect from './ImageSelect';
import { DateTime } from 'luxon';
import { imageFactory } from 'src/factories';
import { imagesToGroupedItems } from './ImageSelect';
import { render, screen } from '@testing-library/react';
import { wrapWithTheme } from 'src/utilities/testHelpers';

describe('imagesToGroupedItems', () => {
  it('should filter deprecated images when end of life is past beyond 6 months ', () => {
    const images = [
      ...imageFactory.buildList(2, {
        label: 'Debian 9',
        deprecated: true,
        created: '2017-06-16T20:02:29',
        eol: '2022-01-01T14:05:30',
      }),
      ...imageFactory.buildList(2, {
        label: 'Debian 10',
        deprecated: false,
        created: '2017-06-16T20:02:29',
        eol: '1970-01-01T14:05:30',
      }),
      ...imageFactory.buildList(2, {
        label: 'Slackware 14.1',
        deprecated: true,
        created: '2022-10-20T14:05:30',
        eol: null,
      }),
    ];
    const expected = [
      {
        label: 'My Images',
        options: [
          {
            created: '2022-10-20T14:05:30',
            label: 'Slackware 14.1',
            value: 'private/4',
            className: 'fl-tux',
            isCloudInitCompatible: false,
          },
          {
            created: '2022-10-20T14:05:30',
            label: 'Slackware 14.1',
            value: 'private/5',
            className: 'fl-tux',
            isCloudInitCompatible: false,
          },
        ],
      },
    ];
    expect(imagesToGroupedItems(images)).toStrictEqual(expected);
  });
  it('should add suffix `deprecated` to images at end of life ', () => {
    const images = [
      ...imageFactory.buildList(2, {
        label: 'Debian 9',
        deprecated: true,
        created: '2017-06-16T20:02:29',
        eol: DateTime.now().toISODate(),
      }),
      ...imageFactory.buildList(2, {
        label: 'Debian 10',
        deprecated: false,
        created: '2017-06-16T20:02:29',
        eol: '1970-01-01T14:05:30',
      }),
    ];
    const expected = [
      {
        label: 'My Images',
        options: [
          {
            created: '2017-06-16T20:02:29',
            label: 'Debian 9 (deprecated)',
            value: 'private/6',
            className: 'fl-tux',
            isCloudInitCompatible: false,
          },
          {
            created: '2017-06-16T20:02:29',
            label: 'Debian 9 (deprecated)',
            value: 'private/7',
            className: 'fl-tux',
            isCloudInitCompatible: false,
          },
        ],
      },
    ];
    expect(imagesToGroupedItems(images)).toStrictEqual(expected);
  });

  it('should render the component', () => {
    render(
      wrapWithTheme(
        <ImageSelect
          disabled={false}
          handleSelectImage={() => {}}
          images={[]}
          selectedImageID={undefined}
          title="Select Image"
          variant="public"
          classNames=""
        />
      )
    );

    // Assert that the component is rendered correctly
    const selectImagePanel = screen.getByTestId('data-qa-select-image-panel');
    expect(selectImagePanel).toBeInTheDocument();
  });

  it('should not re-render if the props have not changed', () => {
    const handleSelectImage = jest.fn();
    const { rerender } = render(
      wrapWithTheme(
        <ImageSelect
          disabled={false}
          handleSelectImage={handleSelectImage({
            created: '2017-06-16T20:02:29',
            label: 'Debian 9 (deprecated)',
            value: 'private/6',
            className: 'fl-tux',
            isCloudInitCompatible: false,
          })}
          images={[]}
          selectedImageID={''}
          title="Select Image"
          variant="public"
          classNames=""
        />
      )
    );

    // Update the component props with the same values
    rerender(
      wrapWithTheme(
        <ImageSelect
          disabled={false}
          handleSelectImage={handleSelectImage({
            created: '2017-06-16T20:02:29',
            label: 'Debian 9 (deprecated)',
            value: 'private/6',
            className: 'fl-tux',
            isCloudInitCompatible: false,
          })}
          images={[]}
          selectedImageID={''}
          title="Select Image"
          variant="public"
          classNames=""
        />
      )
    );

    // Assert that the component is not re-rendered
    expect(handleSelectImage).toHaveBeenCalledTimes(0);
  });

  it('should re-render if the relevant props have changed', () => {
    const handleSelectImage = jest.fn();
    const { rerender } = render(
      wrapWithTheme(
        <ImageSelect
          disabled={false}
          handleSelectImage={handleSelectImage({
            created: '2017-06-16T20:02:29',
            label: 'Debian 9 (deprecated)',
            value: 'private/6',
            className: 'fl-tux',
            isCloudInitCompatible: false,
          })}
          images={[]}
          selectedImageID={''}
          title="Select Image"
          variant="public"
          classNames=""
        />
      )
    );

    // Update the component props with different values
    rerender(
      wrapWithTheme(
        <ImageSelect
          disabled={true}
          handleSelectImage={handleSelectImage({
            created: '2017-06-16T20:02:29',
            label: 'Debian 9 (deprecated)',
            value: 'private/6',
            className: 'fl-tux',
            isCloudInitCompatible: false,
          })}
          images={[]}
          selectedImageID={''}
          title="Select Image"
          variant="public"
          classNames=""
        />
      )
    );

    // Assert that the component is re-rendered
    expect(handleSelectImage).toHaveBeenCalledTimes(1);
  });
});
