import {
  basename,
  confirmObjectStorage,
  displayName,
  extendObject,
  firstSubfolder,
  generateObjectUrl,
  isFile,
  isFolder,
  prefixArrayToString,
  tableUpdateAction,
} from './utilities';

import type { ObjectStorageObject } from '@linode/api-v4/lib/object-storage';

const folder: ObjectStorageObject = {
  etag: null,
  last_modified: null,
  name: 'my-folder',
  owner: null,
  size: null,
};
const object1: ObjectStorageObject = {
  etag: '4agr3fbzvf4haf86bGFdac325c6bfga27',
  last_modified: '2019-09-05T12:00:00.000Z',
  name: 'file1.txt',
  owner: '912b4786-d307-11e9-bb65-2a2ae2dbcce4',
  size: 0,
};
const object2: ObjectStorageObject = {
  etag: '4agr3fbzvf4haf86bGFdac325c6bfga27',
  last_modified: '2019-09-05T12:00:00.000Z',
  name: 'my-folder/file2.txt',
  owner: '912b4786-d307-11e9-bb65-2a2ae2dbcce4',
  size: 0,
};
const object3: ObjectStorageObject = {
  etag: '4agr3fbzvf4haf86bGFdac325c6bfga27',
  last_modified: '2019-09-05T12:00:00.000Z',
  name: 'my-folder/',
  owner: '912b4786-d307-11e9-bb65-2a2ae2dbcce4',
  size: 0,
};

const mockHostname = 'my-bucket.linodeobjects.com';

describe('Object Storage utilities', () => {
  describe('generateObjectUrl', () => {
    it('returns the correct URL', () => {
      expect(generateObjectUrl(mockHostname, 'my-object')).toBe(
        'https://my-bucket.linodeobjects.com/my-object'
      );
    });
    it('encodes the URL for special characters', () => {
      expect(generateObjectUrl(mockHostname, 'my-object?')).toBe(
        'https://my-bucket.linodeobjects.com/my-object%3F'
      );
    });
  });

  describe('isFolder', () => {
    it('returns `true` if the object has null for fields except `name`', () => {
      expect(isFolder(folder)).toBe(true);
      const notAFolder = {
        ...folder,
        etag: 'my-etag',
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

  describe('prefixArrayToString', () => {
    it('returns a string with each element of the array joined by a slash', () => {
      const result = prefixArrayToString(['hello', 'world'], 2);
      expect(result).toBe('hello/world/');
    });

    it('allows specification of an ending index', () => {
      const result1 = prefixArrayToString(['hello', 'world', 'test'], 0);
      expect(result1).toBe('hello/');
      const result2 = prefixArrayToString(['hello', 'world', 'test'], 1);
      expect(result2).toBe('hello/world/');
      const result3 = prefixArrayToString(['hello', 'world', 'test'], 2);
      expect(result3).toBe('hello/world/test/');
    });

    it('returns nothing if prefixArray is empty', () => {
      const result = prefixArrayToString([], 0);
      expect(result).toBe('');
    });

    it('behaves like the cutoff is the length of the prefix array if the given cutoff is greater', () => {
      const result = prefixArrayToString(['hello', 'world'], 8);
      expect(result).toBe('hello/world/');
    });
  });

  describe('displayName', () => {
    it('returns the basename', () => {
      expect(displayName('hello.jpg')).toBe('hello.jpg');
      expect(displayName('hello/world.jpg')).toBe('world.jpg');
      expect(displayName('testing/hello/world.jpg')).toBe('world.jpg');
    });
    it('ignores trailing slashes', () => {
      expect(displayName('hello/world.jpg')).toBe('world.jpg');
    });
  });

  describe('getElementToAddToTable', () => {
    it('should return files', () => {
      expect(tableUpdateAction('', 'file.txt')).toEqual({
        name: 'file.txt',
        type: 'FILE',
      });
      expect(tableUpdateAction('hello/', 'hello/file.txt')).toEqual({
        name: 'file.txt',
        type: 'FILE',
      });
      expect(tableUpdateAction('hello/world/', 'hello/world/file.txt')).toEqual(
        {
          name: 'file.txt',
          type: 'FILE',
        }
      );
    });

    it('should return folders', () => {
      expect(tableUpdateAction('', 'hello/file.txt')).toEqual({
        name: 'hello',
        type: 'FOLDER',
      });
      expect(tableUpdateAction('hello/', 'hello/world/file.txt')).toEqual({
        name: 'world',
        type: 'FOLDER',
      });
      expect(
        tableUpdateAction('hello/world/', 'hello/world/path/file.txt')
      ).toEqual({
        name: 'path',
        type: 'FOLDER',
      });
    });

    it('returns null if the prefix does not match', () => {
      expect(tableUpdateAction('another/path', 'hello/file.txt')).toBe(null);
      expect(tableUpdateAction('some/', 'hello/file.txt')).toBe(null);
      expect(
        tableUpdateAction('some/another/path', 'another/path/file.txt')
      ).toBe(null);
    });
  });

  describe('isFile', () => {
    it('should return true for files and false for folders', () => {
      expect(isFile('file.txt')).toBe(true);
      expect(isFile('file')).toBe(true);
      expect(isFile('file')).toBe(true);
      expect(isFile('folder/file')).toBe(false);
      expect(isFile('folder/file.txt')).toBe(false);
      expect(isFile('folder/path/file.txt')).toBe(false);
    });
  });

  describe('firstSubfolder', () => {
    it('should return the first subfolder in a given path', () => {
      expect(firstSubfolder('path/file1')).toBe('path');
      expect(firstSubfolder('path1/path2/file.txt')).toBe('path1');
      expect(firstSubfolder('file1')).toBe('file1');
    });
  });

  describe('confirmObjectStorage', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });
    const validateForm = vi.fn(() => Promise.resolve({}));
    const setFieldTouched = vi.fn();
    const setFieldError = vi.fn();
    const handleSubmit = vi.fn();
    const openConfirmationDialog = vi.fn();
    const mockFormikProps = {
      handleSubmit,
      setFieldError,
      setFieldTouched,
      validateForm,
    } as any;

    it("doesn't call the confirmation handler if OBJ is active", async () => {
      await confirmObjectStorage(
        'active',
        mockFormikProps,
        openConfirmationDialog
      );
      expect(openConfirmationDialog).toHaveBeenCalledTimes(0);
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
    it('calls call the confirmation handler if OBJ is disabled', async () => {
      await confirmObjectStorage(
        'disabled',
        mockFormikProps,
        openConfirmationDialog
      );
      expect(openConfirmationDialog).toHaveBeenCalledTimes(1);
      expect(handleSubmit).toHaveBeenCalledTimes(0);
    });
  });
});
