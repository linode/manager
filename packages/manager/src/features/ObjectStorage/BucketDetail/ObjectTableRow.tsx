import * as React from 'react';

import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';

import { formatObjectStorageCluster } from 'src/utilities/formatRegion';
import { readableBytes } from 'src/utilities/unitConversions';
// Keep this for when we display URL on hover
// import { generateObjectUrl } from '../utilities';

interface Props {
  clusterId: Linode.ClusterID;
  bucketName: string;
  objectName: string;
  objectSize: number;
  objectLastModified: string;
}

const ObjectTableRow: React.FC<Props> = props => {
  const {
    clusterId,
    // Keep this for when we display URL on hover
    // bucketName,
    objectName,
    objectSize,
    objectLastModified
  } = props;

  // Keep this for when we display URL on hover
  // const objectUrl = generateObjectUrl(clusterId, bucketName, objectName);

  return (
    <TableRow key={objectName}>
      <TableCell parentColumn="Object">
        <Grid container alignItems="center">
          <Grid item>
            <EntityIcon variant="object" size={20} />
          </Grid>
          <Grid item>
            <Typography variant="h3">{objectName}</Typography>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell parentColumn="Size">
        {readableBytes(objectSize).formatted}
      </TableCell>
      <TableCell parentColumn="Region">
        {formatObjectStorageCluster(clusterId)}
      </TableCell>
      <TableCell parentColumn="Last Modified">
        <DateTimeDisplay value={objectLastModified} humanizeCutoff="never" />
      </TableCell>
    </TableRow>
  );
};

export default ObjectTableRow;
