import { basename, extendObject, isFolder } from './utilities';

const folder: Linode.Object = {
  name: 'my-folder',
  etag: null,
  last_modified: null,
  owner: null,
  size: null
};
const object1: Linode.Object = {
  name: 'file1.txt',
  etag: '4agr3fbzvf4haf86bGFdac325c6bfga27',
  last_modified: '2019-09-05T12:00:00.000Z',
  owner: '912b4786-d307-11e9-bb65-2a2ae2dbcce4',
  size: 0
};
const object2: Linode.Object = {
  name: 'my-folder/file2.txt',
  etag: '4agr3fbzvf4haf86bGFdac325c6bfga27',
  last_modified: '2019-09-05T12:00:00.000Z',
  owner: '912b4786-d307-11e9-bb65-2a2ae2dbcce4',
  size: 0
};
const object3: Linode.Object = {
  name: 'my-folder/',
  etag: '4agr3fbzvf4haf86bGFdac325c6bfga27',
  last_modified: '2019-09-05T12:00:00.000Z',
  owner: '912b4786-d307-11e9-bb65-2a2ae2dbcce4',
  size: 0
};

describe('Object Storage utilities', () => {
  describe('isFolder', () => {
    it('returns `true` if the object has null for fields except `name`', () => {
      expect(isFolder(folder)).toBe(true);
      const notAFolder = {
        ...folder,
        etag: 'my-etag'
      };
      expect(isFolder(notAFolder)).toBe(false);
      expect(isFolder(object1)).toBe(false);
    });
  });

  describe('basename', () => {
    it('returns the portion of the pathname AFTER the last slash', () => {
      const pathname = 'my-folder/file1.txt';
      expect(basename(pathname)).toBe('file1.txt');
    });
    it('works if there are multiple slashes', () => {
      const pathname = 'my-folder/nested-folder/file2.txt';
      expect(basename(pathname)).toBe('file2.txt');
    });
    it('returns the original input if there are no slashes', () => {
      const pathname = 'file3.txt';
      expect(basename(pathname)).toBe(pathname);
    });
    it('handles custom delimiters', () => {
      const pathname = 'my-folder;file4.txt';
      expect(basename(pathname, ';')).toBe('file4.txt');
    });
  });

  describe('extendObject', () => {
    it('adds a _displayName field, which is the basename', () => {
      expect(extendObject(object2, '')).toHaveProperty(
        '_displayName',
        'file2.txt'
      );
    });
    it('adds an _isFolder field, which is `true` if the object can be considered a folder', () => {
      expect(extendObject(folder, '')).toHaveProperty('_isFolder', true);
      expect(extendObject(object2, '')).toHaveProperty('_isFolder', false);
    });
    it("adds an _shouldDisplayObject field, which should be `true` if the object doesn't equal the prefix", () => {
      expect(extendObject(object3, '')).toHaveProperty(
        '_shouldDisplayObject',
        true
      );
      expect(extendObject(object3, 'my-folder/')).toHaveProperty(
        '_shouldDisplayObject',
        false
      );
    });
  });
});

extendObject(object1, 'hello');
