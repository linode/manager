import { imagesToGroupedItems } from './ImageSelect';
import { imageFactory } from 'src/factories';

describe('imagesToGroupedItems', () => {
  it('should filter deprecated images when eol date is beyond 6 months ', () => {
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
          },
          {
            created: '2022-10-20T14:05:30',
            label: 'Slackware 14.1',
            value: 'private/5',
            className: 'fl-tux',
          },
        ],
      },
    ];
    expect(imagesToGroupedItems(images)).toStrictEqual(expected);
  });
});
