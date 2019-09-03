import { Image } from 'linode-js-sdk/lib/images';
import {
  getMyImages,
  getOlderPublicImages,
  getPublicImages
} from './SelectImagePanel';

describe('CreateFromImage', () => {
  const images: Partial<Image>[] = [
    {
      vendor: 'Slackware',
      id: 'linode/',
      created: '2013-11-25T16:11:02'
    },
    {
      vendor: 'Ubuntu',
      id: 'private/',
      created: '2017-12-28T18:16:59'
    },
    {
      vendor: 'Ubuntu',
      id: 'linode/',
      created: '2014-04-28T18:16:59'
    },
    {
      vendor: 'Slackware',
      id: 'linode/',
      created: '2011-06-05T19:11:59'
    },
    {
      vendor: 'Ubuntu',
      id: 'private/',
      created: '2016-08-13T21:22:25'
    },
    {
      vendor: 'Ubuntu',
      id: 'linode/',
      created: '2016-04-22T18:11:29'
    },
    {
      vendor: 'Slackware',
      id: 'linode/',
      created: '2016-10-13T13:14:34'
    },
    {
      vendor: 'Ubuntu',
      id: 'private/',
      created: '2016-10-13T21:22:25'
    },
    {
      vendor: 'Ubuntu',
      id: 'linode/',
      created: '2016-10-13T21:22:25'
    }
  ];

  describe('getPublicImages', () => {
    it('should work', () => {
      const result = getPublicImages(images);
      const expected = [
        {
          vendor: 'Slackware',
          id: 'linode/',
          created: '2016-10-13T13:14:34'
        },
        {
          vendor: 'Ubuntu',
          id: 'linode/',
          created: '2016-10-13T21:22:25'
        }
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('getOlderPublicImages', () => {
    it('should work', () => {
      const result = getOlderPublicImages(images);
      const expected = [
        {
          vendor: 'Slackware',
          id: 'linode/',
          created: '2013-11-25T16:11:02'
        },
        {
          vendor: 'Slackware',
          id: 'linode/',
          created: '2011-06-05T19:11:59'
        },
        {
          vendor: 'Ubuntu',
          id: 'linode/',
          created: '2016-04-22T18:11:29'
        },
        {
          vendor: 'Ubuntu',
          id: 'linode/',
          created: '2014-04-28T18:16:59'
        }
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('getMyImages', () => {
    const result = getMyImages(images);
    const expected = [
      {
        vendor: 'Ubuntu',
        id: 'private/',
        created: '2017-12-28T18:16:59'
      },
      {
        vendor: 'Ubuntu',
        id: 'private/',
        created: '2016-10-13T21:22:25'
      },
      {
        vendor: 'Ubuntu',
        id: 'private/',
        created: '2016-08-13T21:22:25'
      }
    ];

    expect(result).toEqual(expected);
  });
});
