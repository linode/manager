import * as React from 'react';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import ObjectTableRow from './ObjectTableRow';

interface Props {
  data: Linode.Object[];
  loading: boolean;
  error?: Linode.ApiFieldError[];
  clusterId: Linode.ClusterID;
  bucketName: string;
}

type CombinedProps = Props;

const ObjectTable: React.FC<CombinedProps> = props => {
  if (props.loading) {
    return <TableRowLoading colSpan={6} />;
  }

  if (props.error) {
    return (
      <TableRowError
        colSpan={6}
        message="We were unable to load your Objects."
      />
    );
  }

  if (props.data.length === 0) {
    return (
      <TableRowEmptyState
        colSpan={6}
        message="You don't have any Objects in this Bucket."
      />
    );
  }

  return (
    <>
      {props.data.map(object => (
        <ObjectTableRow
          key={object.name}
          objectName={object.name}
          objectSize={object.size}
          objectLastModified={object.last_modified}
          clusterId={props.clusterId}
          bucketName={props.bucketName}
        />
      ))}
    </>
  );
};

export default ObjectTable;
