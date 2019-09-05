import { OBJECT_STORAGE_ROOT } from 'src/constants';

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

export const isCurrentDirectory = (object: Linode.Object, prefix: string) => {
  return prefix.endsWith('/') && object.name === prefix;
};

/**
 * Returns the basename of the given path
 *
 * @example
 * basename('my-path/folder/test.txt') // test.txt
 */
export const basename = (path: string, delimiter = '/') => {
  return path.substr(path.lastIndexOf(delimiter) + 1);
};

export const formatFolderName = (folderName: string, delimiter = '/') => {
  return basename(folderName.substr(0, folderName.length - 1));
};

export interface ExtendedObject extends Linode.Object {
  displayName: string;
}

export const extendObject = (object: Linode.Object): ExtendedObject => {
  return {
    ...object,
    displayName: isFolder(object)
      ? formatFolderName(object.name)
      : basename(object.name)
  };
};
