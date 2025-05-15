import { OBJECT_STORAGE_DELIMITER } from 'src/constants';

import type { AccountSettings } from '@linode/api-v4/lib/account';
import type { ObjectStorageObject } from '@linode/api-v4/lib/object-storage';
import type { ObjectStorageEndpoint } from '@linode/api-v4/lib/object-storage';
import type { FormikProps } from 'formik';

export const generateObjectUrl = (hostname: string, objectName: string) => {
  return `https://${hostname}/${encodeURIComponent(objectName)}`;
};

// Objects ending with a / and having a size of 0 are often used to represent
// "folders".
export const isEmptyObjectForFolder = (object: ObjectStorageObject) =>
  object.name.endsWith('/') && object.size === 0;

// If an Object does not have an etag, last_modified, owner, or size, it can
// be considered a "folder".
export const isFolder = (object: ObjectStorageObject) =>
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

export interface ACLType {
  label: string;
  value: string;
}

export interface ExtendedObject extends ObjectStorageObject {
  _displayName: string;
  _isFolder: boolean;
  _shouldDisplayObject: boolean;
}

export const extendObject = (
  object: ObjectStorageObject,
  prefix: string
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
    _displayName,
    _isFolder,
    // since it will also be "my-folder/".
    _shouldDisplayObject: object.name !== prefix,
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
  return prefixSlice + '/';
};

export const displayName = (objectName: string) => {
  return objectName.endsWith('/')
    ? basename(objectName.substr(0, objectName.length - 1))
    : basename(objectName);
};

// Given a prefix and an object name, determine table update action to take once
// the upload is successful.
export const tableUpdateAction = (
  currentPrefix: string,
  objectName: string
): null | { name: string; type: 'FILE' | 'FOLDER' } => {
  if (objectName.startsWith(currentPrefix) || currentPrefix === '') {
    // If the prefix matches the beginning of the objectName, we "subtract" it
    // from the objectName, and make decisions based on that.

    // Example: if the current prefix is 'my-folder/' and the objectName is
    // 'my-folder/my-file.txt', we just need to look at 'my-file.txt'.
    const delta = objectName.slice(currentPrefix.length);

    if (isFile(delta)) {
      return { name: delta, type: 'FILE' };
    } else {
      return { name: firstSubfolder(delta), type: 'FOLDER' };
    }
  }
  return null;
};

export const isFile = (path: string) => path.split('/').length < 2;

export const firstSubfolder = (path: string) => path.split('/')[0];

export const confirmObjectStorage = async <T extends {}>(
  object_storage: AccountSettings['object_storage'],
  formikProps: FormikProps<T>,
  openConfirmationDialog: () => void
): Promise<void> => {
  if (object_storage !== 'disabled') {
    formikProps.handleSubmit();
    return;
  }
  // But first, manually validate the form.
  const validationErrors = await formikProps.validateForm();
  if (Object.keys(validationErrors).length > 0) {
    // Set `touched` and `error` for each field with an error.
    // Setting `touched` is necessary because we only display errors
    // on fields that have been touched (handleSubmit() does this
    // implicitly).
    Object.keys(validationErrors).forEach((key) => {
      formikProps.setFieldTouched(
        key,
        Boolean(validationErrors[key as keyof T])
      );
      formikProps.setFieldError(
        key,
        validationErrors[key as keyof T] as string
      );
    });
  } else {
    openConfirmationDialog();
  }
};

export const objectACLOptions: ACLType[] = [
  { label: 'Private', value: 'private' },
  { label: 'Authenticated Read', value: 'authenticated-read' },
  { label: 'Public Read', value: 'public-read' },
];

export const bucketACLOptions: ACLType[] = [
  ...objectACLOptions,
  { label: 'Public Read/Write', value: 'public-read-write' },
];

export const objectACLHelperText: Record<string, string> = {
  'authenticated-read': 'Authenticated Read ACL',
  custom: 'Custom ACL',
  private: 'Private ACL',
  'public-read': 'Public Read ACL',
  'public-read-write': 'Public Read/Write ACL',
};

// @TODO: OBJ Gen2: This should be removed once these regions obtain the `Object Storage` capability.
export const WHITELISTED_REGIONS = new Set([
  'gb-lon',
  'au-mel',
  'in-bom-2',
  'de-fra-2',
  'sg-sin-2',
]);

/**
 * For OBJ Gen2 users, filter regions based on available Object Storage endpoints.
 * Otherwise, we return the regions as is.
 */
export const filterRegionsByEndpoints = <T extends { id: string }>(
  regions: T[] | undefined,
  objecStorageEndpoints: ObjectStorageEndpoint[] | undefined
): T[] => {
  if (!regions) {
    return [];
  }

  if (!objecStorageEndpoints) {
    return regions;
  }

  const endpointRegions = new Set(
    objecStorageEndpoints.map((endpoint) => endpoint.region)
  );

  return regions.filter((region) => endpointRegions.has(region.id));
};
