import * as React from 'react';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { ExtendedObject } from '../utilities';
import FolderTableRow from './FolderTableRow';
import ObjectTableRow from './ObjectTableRow';

interface Props {
  clusterId: Linode.ClusterID;
  bucketName: string;
  data: ExtendedObject[];
  loading: boolean;
  error?: Linode.ApiFieldError[];
  nextPageError?: Linode.ApiFieldError[];
  prefix: string;
}

const ObjectTableContent: React.FC<Props> = props => {
  const { clusterId, bucketName, data, loading, error, nextPageError } = props;

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

  // A folder is considered "empty" if `_shouldDisplayObject` is `false` for
  // every object in the folder.
  const isFolderEmpty = data.every(object => !object._shouldDisplayObject);

  if (isFolderEmpty) {
    return (
      <TableRowEmptyState
        colSpan={6}
        message="No objects matching this prefix."
      />
    );
  }

  return (
    <>
      {data.map(object => {
        if (!object._shouldDisplayObject) {
          return null;
        }

        if (object._isFolder) {
          return (
            <FolderTableRow
              key={object.name}
              folderName={object.name}
              displayName={object._displayName}
            />
          );
        }

        return (
          <ObjectTableRow
            key={object.name}
            clusterId={clusterId}
            bucketName={bucketName}
            objectName={object._displayName}
            /**
             * In reality, if there's no `size` or `last_modified`, we're
             * probably dealing with a folder and will have already returned
             * `null`. The OR fallbacks are to make TSC happy, and to safeguard
             * in the event of the data being something we don't expect.
             */
            objectSize={object.size || 0}
            objectLastModified={object.last_modified || ''}
          />
        );
      })}
      {loading && <TableRowLoading colSpan={12} transparent />}
      {nextPageError && (
        <TableRowError colSpan={12} message={nextPageError[0].reason} />
      )}
    </>
  );
};

export default React.memo(ObjectTableContent);
