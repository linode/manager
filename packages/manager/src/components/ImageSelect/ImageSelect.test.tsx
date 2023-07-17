import { DateTime } from 'luxon';

import { imageFactory } from 'src/factories';

import { imagesToGroupedItems } from './ImageSelect';

describe('imagesToGroupedItems', () => {
  it('should filter deprecated images when end of life is past beyond 6 months ', () => {
    const images = [
      ...imageFactory.buildList(2, {
        created: '2017-06-16T20:02:29',
        deprecated: true,
        eol: '2022-01-01T14:05:30',
        label: 'Debian 9',
      }),
      ...imageFactory.buildList(2, {
        created: '2017-06-16T20:02:29',
        deprecated: false,
        eol: '1970-01-01T14:05:30',
        label: 'Debian 10',
      }),
      ...imageFactory.buildList(2, {
        created: '2022-10-20T14:05:30',
        deprecated: true,
        eol: null,
        label: 'Slackware 14.1',
      }),
    ];
    const expected = [
      {
        label: 'My Images',
        options: [
          {
            className: 'fl-tux',
            created: '2022-10-20T14:05:30',
            isCloudInitCompatible: false,
            label: 'Slackware 14.1',
            value: 'private/4',
          },
          {
            className: 'fl-tux',
            created: '2022-10-20T14:05:30',
            isCloudInitCompatible: false,
            label: 'Slackware 14.1',
            value: 'private/5',
          },
        ],
      },
    ];
    expect(imagesToGroupedItems(images)).toStrictEqual(expected);
  });
  it('should add suffix `deprecated` to images at end of life ', () => {
    const images = [
      ...imageFactory.buildList(2, {
        created: '2017-06-16T20:02:29',
        deprecated: true,
        eol: DateTime.now().toISODate(),
        label: 'Debian 9',
      }),
      ...imageFactory.buildList(2, {
        created: '2017-06-16T20:02:29',
        deprecated: false,
        eol: '1970-01-01T14:05:30',
        label: 'Debian 10',
      }),
    ];
    const expected = [
      {
        label: 'My Images',
        options: [
          {
            className: 'fl-tux',
            created: '2017-06-16T20:02:29',
            isCloudInitCompatible: false,
            label: 'Debian 9 (deprecated)',
            value: 'private/6',
          },
          {
            className: 'fl-tux',
            created: '2017-06-16T20:02:29',
            isCloudInitCompatible: false,
            label: 'Debian 9 (deprecated)',
            value: 'private/7',
          },
        ],
      },
    ];
    expect(imagesToGroupedItems(images)).toStrictEqual(expected);
  });
});
