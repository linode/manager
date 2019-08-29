import * as React from 'react';

import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';

import ObjectTableRow from './ObjectTableRow';

interface Props {
  clusterId: Linode.ClusterID;
  bucketName: string;
  data: Linode.Object[];
  loading: boolean;
  error?: Linode.ApiFieldError[];
}

const ObjectTable: React.FC<Props> = props => {
  const { clusterId, bucketName, data, loading, error } = props;

  if (loading) {
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
      {data.map(object => (
        <ObjectTableRow
          key={object.name}
          clusterId={clusterId}
          bucketName={bucketName}
          objectName={object.name}
          objectSize={object.size}
          objectLastModified={object.last_modified}
        />
      ))}
    </>
  );
};

export default ObjectTable;
