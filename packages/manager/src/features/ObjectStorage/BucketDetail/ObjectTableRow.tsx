import * as React from 'react';
import Box from 'src/components/core/Box';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { formatObjectStorageCluster } from 'src/utilities/formatRegion';
import { truncateFileName } from 'src/utilities/truncateFileName';
import { readableBytes } from 'src/utilities/unitConversions';

interface Props {
  clusterId: Linode.ClusterID;
  objectName: string;
  objectSize: number;
  objectLastModified: string;
}

const ObjectTableRow: React.FC<Props> = props => {
  const { clusterId, objectName, objectSize, objectLastModified } = props;

  const truncatedObjectName = truncateFileName(objectName);

  return (
    <TableRow>
      <TableCell parentColumn="Object">
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className="py0">
            <EntityIcon variant="object" size={20} />
          </Grid>
          <Grid item>
            <Box display="flex" alignItems="center">
              <Typography variant="h3">{truncatedObjectName}</Typography>
            </Box>
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

export default React.memo(ObjectTableRow);
