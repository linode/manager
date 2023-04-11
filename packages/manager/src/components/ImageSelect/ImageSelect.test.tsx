import { DateTime } from 'luxon';
import { imageFactory } from 'src/factories';

import { imagesToGroupedItems } from './ImageSelect';

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
});
