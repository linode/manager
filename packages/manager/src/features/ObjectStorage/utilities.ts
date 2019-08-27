import { OBJ_HOST_NAME } from 'src/constants';

export const generateObjectUrl = (
  clusterId: Linode.ClusterID,
  bucketName: string,
  objectName: string
) => {
  const path = `${bucketName}.${clusterId}.${OBJ_HOST_NAME}/${objectName}`;
  return {
    path,
    absolute: 'https://' + path
  };
};
