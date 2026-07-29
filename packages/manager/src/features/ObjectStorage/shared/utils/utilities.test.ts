import {
  basename,
  confirmObjectStorage,
  displayName,
  extendObject,
  filterBucketsByEndpoints,
  filterSet,
  firstSubfolder,
  generateObjectUrl,
  getRequiredObjectStorageRegionIds,
  isFile,
  isFolder,
  matchesFilter,
  parseCsvSet,
  prefixArrayToString,
  tableUpdateAction,
  toSortedCsv,
  toStringSet,
} from './utilities';

import type {
  ObjectStorageBucket,
  ObjectStorageEndpoint,
} from '@linode/api-v4';
import type { ObjectStorageObject } from '@linode/api-v4';

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
      expect(generateObjectUrl(mockHostname, 'my-folder/my-object')).toBe(
        'https://my-bucket.linodeobjects.com/my-folder/my-object'
      );
    });
    it('encodes the URL for special characters', () => {
      expect(generateObjectUrl(mockHostname, 'my-object!@#$%^&*()_+<>.,')).toBe(
        'https://my-bucket.linodeobjects.com/my-object!@#$%25%5E&*()_+%3C%3E.,'
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

  describe('getRequiredObjectStorageRegionIds', () => {
    const endpoints: ObjectStorageEndpoint[] = [
      { region: 'us\-east', s3_endpoint: 'us\-east\-1' } as any,
      { region: 'us\-west', s3_endpoint: 'us\-west\-1' } as any,
      { region: 'eu\-central', s3_endpoint: 'eu\-central\-1' } as any,
      // s3_endpoint may be absent in some data shapes; keep as undefined to
      // exercise the non\-null assertion path (it should just not match filters).
      { region: 'ap\-south' } as any,
    ];

    it('returns undefined if regionIdsFilter is undefined', () => {
      const result = getRequiredObjectStorageRegionIds(
        endpoints,
        undefined,
        null
      );
      expect(result).toBeUndefined();
    });

    it('returns undefined if endpointsFilter is undefined', () => {
      const result = getRequiredObjectStorageRegionIds(
        endpoints,
        null,
        undefined
      );
      expect(result).toBeUndefined();
    });

    it('returns undefined if endpoints is undefined', () => {
      const result = getRequiredObjectStorageRegionIds(undefined, null, null);
      expect(result).toBeUndefined();
    });

    it('returns all endpoint regions when both filters are null', () => {
      const result = getRequiredObjectStorageRegionIds(endpoints, null, null);
      expect(result).toEqual(
        new Set(['us\-east', 'us\-west', 'eu\-central', 'ap\-south'])
      );
    });

    it('filters by regionIdsFilter when endpointsFilter is null', () => {
      const regionIdsFilter = new Set(['us\-west', 'eu\-central']);
      const result = getRequiredObjectStorageRegionIds(
        endpoints,
        regionIdsFilter,
        null
      );
      expect(result).toEqual(new Set(['us\-west', 'eu\-central']));
    });

    it('filters by endpointsFilter when regionIdsFilter is null', () => {
      const endpointsFilter = new Set(['us\-east\-1', 'eu\-central\-1']);
      const result = getRequiredObjectStorageRegionIds(
        endpoints,
        null,
        endpointsFilter
      );
      expect(result).toEqual(new Set(['us\-east', 'eu\-central']));
    });

    it('applies both filters together', () => {
      const regionIdsFilter = new Set(['us\-east', 'us\-west', 'eu\-central']);
      const endpointsFilter = new Set(['us\-west\-1', 'eu\-central\-1']);
      const result = getRequiredObjectStorageRegionIds(
        endpoints,
        regionIdsFilter,
        endpointsFilter
      );
      expect(result).toEqual(new Set(['us\-west', 'eu\-central']));
    });

    it('returns an empty Set when nothing matches (but filters are defined)', () => {
      const regionIdsFilter = new Set(['does\-not\-exist']);
      const endpointsFilter = new Set(['also\-nope']);
      const result = getRequiredObjectStorageRegionIds(
        endpoints,
        regionIdsFilter,
        endpointsFilter
      );
      expect(result).toEqual(new Set());
    });
  });

  describe('filterBucketsByEndpoints', () => {
    const buckets: ObjectStorageBucket[] = [
      { label: 'a', region: 'us\-east', s3_endpoint: 'us\-east\-1' } as any,
      { label: 'b', region: 'us\-west', s3_endpoint: 'us\-west\-1' } as any,
    ];

    it('returns an empty array when buckets is undefined', () => {
      expect(filterBucketsByEndpoints(undefined, null)).toEqual([]);
    });

    it('returns all buckets when endpointsFilter is null', () => {
      expect(filterBucketsByEndpoints(buckets, null)).toEqual(buckets);
    });

    it('filters buckets by s3_endpoint when endpointsFilter is a Set', () => {
      const endpointsFilter = new Set(['us\-west\-1']);
      expect(filterBucketsByEndpoints(buckets, endpointsFilter)).toEqual([
        buckets[1],
      ]);
    });
  });

  describe('parseCsvSet', () => {
    it('returns null for undefined', () => {
      expect(parseCsvSet(undefined)).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(parseCsvSet('')).toBeNull();
    });

    it('splits comma\-separated values into a Set', () => {
      expect(parseCsvSet('a,b,c')).toEqual(new Set(['a', 'b', 'c']));
    });

    it('drops empty segments', () => {
      expect(parseCsvSet('a,,b,')).toEqual(new Set(['a', 'b']));
    });
  });

  describe('toSortedCsv', () => {
    it('returns undefined for null', () => {
      expect(toSortedCsv(null)).toBeUndefined();
    });

    it('returns a sorted, comma\-joined string', () => {
      expect(toSortedCsv(new Set(['b', 'a', 'c']))).toBe('a,b,c');
    });

    it('returns empty string for an empty Set', () => {
      expect(toSortedCsv(new Set())).toBe('');
    });
  });

  describe('matchesFilter', () => {
    it('returns true when filterSet is null (include all)', () => {
      expect(matchesFilter(null, 'x')).toBe(true);
      expect(matchesFilter(null, null)).toBe(true);
      expect(matchesFilter(null, undefined)).toBe(true);
    });

    it('returns false when value is null/undefined and filterSet is not null', () => {
      expect(matchesFilter(new Set(['x']), null)).toBe(false);
      expect(matchesFilter(new Set(['x']), undefined)).toBe(false);
    });

    it('returns true only if value exists in the filterSet', () => {
      const set = new Set(['a', 'b']);
      expect(matchesFilter(set, 'a')).toBe(true);
      expect(matchesFilter(set, 'c')).toBe(false);
    });

    it('returns false for empty string when filterSet is not null (value treated as missing)', () => {
      expect(matchesFilter(new Set(['']), '')).toBe(false);
    });
  });

  describe('filterSet', () => {
    const allowed = new Set(['a', 'b']);

    it('returns null when set is null', () => {
      expect(filterSet(null, allowed)).toBeNull();
    });

    it('returns null when set is undefined', () => {
      expect(filterSet(undefined as any, allowed)).toBeNull();
    });

    it('returns a new Set containing only allowed values', () => {
      const input = new Set(['a', 'c']);
      const result = filterSet(input, allowed);
      expect(result).toEqual(new Set(['a']));
      // ensure it is not the same instance
      expect(result).not.toBe(input);
    });

    it('returns null when no values are allowed after filtering', () => {
      const input = new Set(['c', 'd']);
      expect(filterSet(input, allowed)).toBeNull();
    });

    it('returns null for an empty input Set', () => {
      expect(filterSet(new Set(), allowed)).toBeNull();
    });
  });

  describe('toStringSet', () => {
    it('maps values to strings and returns a Set', () => {
      const result = toStringSet([1, 2, 3], (n) => `id\-${n}`);
      expect(result).toEqual(new Set(['id\-1', 'id\-2', 'id\-3']));
    });

    it('deduplicates when map produces duplicate strings', () => {
      const result = toStringSet([1, 1, 2], (n) => String(n));
      expect(result).toEqual(new Set(['1', '2']));
    });

    it('works with non\-array iterables', () => {
      const values = new Set([10, 20]);
      const result = toStringSet(values, (n) => `${n}`);
      expect(result).toEqual(new Set(['10', '20']));
    });
  });
});
