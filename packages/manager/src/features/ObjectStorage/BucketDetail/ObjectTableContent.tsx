import * as React from 'react';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { ExtendedObject, isFolder } from '../utilities';
import FolderTableRow from './FolderTableRow';
import ObjectTableRow from './ObjectTableRow';

interface Props {
  clusterId: Linode.ClusterID;
  bucketName: string;
  data: ExtendedObject[];
  loading: boolean;
  error?: Linode.ApiFieldError[];
  prefix: string;
}

const ObjectTable: React.FC<Props> = props => {
  const { clusterId, bucketName, data, loading, error, prefix } = props;

  if (loading && data.length === 0) {
    return <TableRowLoading colSpan={6} />;
  }

  if (error) {
    return (
      <TableRowError
        colSpan={6}
        message="We were unable to load your Objects."
      />
    );
  }

  if (data.length === 0) {
    return (
      <TableRowEmptyState
        colSpan={6}
        message="You don't have any Objects in this Bucket."
      />
    );
  }

  return (
    <>
      {data.map(object => {
        console.log(object.displayName);
        if (!object.displayName || object.displayName.endsWith('/')) {
          return null;
        }

        if (isFolder(object)) {
          return (
            <FolderTableRow
              key={object.name}
              folderName={object.name}
              displayName={object.displayName}
            />
          );
        }

        return (
          <ObjectTableRow
            key={object.name}
            clusterId={clusterId}
            bucketName={bucketName}
            objectName={object.displayName}
            objectSize={object.size}
            objectLastModified={object.last_modified}
          />
        );
      })}
      {loading && <TableRowLoading colSpan={12} transparent />}
    </>
  );
};

export default ObjectTable;
