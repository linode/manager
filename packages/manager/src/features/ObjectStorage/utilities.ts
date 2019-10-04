import { OBJECT_STORAGE_DELIMITER, OBJECT_STORAGE_ROOT } from 'src/constants';

export const generateObjectUrl = (
  clusterId: Linode.ClusterID,
  bucketName: string,
  objectName: string
) => {
  const path = `${bucketName}.${clusterId}.${OBJECT_STORAGE_ROOT}/${objectName}`;
  return {
    path,
    absolute: 'https://' + path
  };
};

// If an Object does not have an etag, last_modified, owner, or size, it can
// be considered a "folder".
export const isFolder = (object: Linode.Object) =>
  !object.etag && !object.last_modified && !object.owner && !object.size;

/**
 * Returns the basename of the given path.
 *
 * @example
 * basename('my-path/folder/test.txt') // test.txt
 */
export const basename = (
  path: string,
  delimiter = OBJECT_STORAGE_DELIMITER
): string => {
  const idx = path.lastIndexOf(delimiter);

  // If the delimiter is not found in the string, there's nothing to do.
  if (idx === -1) {
    return path;
  }

  return path.substr(idx + 1);
};

export interface ExtendedObject extends Linode.Object {
  _isFolder: boolean;
  _displayName: string;
  _shouldDisplayObject: boolean;
  _manuallyCreated: boolean;
}

export const extendObject = (
  object: Linode.Object,
  prefix: string,
  manuallyCreated = false
): ExtendedObject => {
  const _isFolder = isFolder(object);

  // In many cases, we don't want to display the entire object name, since
  // it could include a path, like "my-folder/another-folder/file.txt". We only
  // want the basename (the part after the last slash). If the object ends with
  // a slash (i.e. the object is a folder), get the basename, ignoring the
  // trailing slash.
  const _displayName = displayName(object.name);

  return {
    ...object,
    _isFolder,
    _displayName,
    // If we're in a folder called "my-folder", we don't want to show the object
    // called "my-folder/". We can look at the prefix to make this decision,
    // since it will also be "my-folder/".
    _shouldDisplayObject: object.name !== prefix,
    _manuallyCreated: manuallyCreated
  };
};

export const prefixArrayToString = (prefixArray: string[], cutoff: number) => {
  if (prefixArray.length === 0) {
    return '';
  }

  if (cutoff > prefixArray.length - 1) {
    cutoff = prefixArray.length - 1;
  }

  const prefixSlice = prefixArray.slice(0, cutoff + 1).join('/');
  const prefixString = prefixSlice + '/';
  return prefixString;
};

export const displayName = (objectName: string) => {
  return objectName.endsWith('/')
    ? basename(objectName.substr(0, objectName.length - 1))
    : basename(objectName);
};
