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
