import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { formatObjectStorageCluster } from 'src/utilities/formatRegion';
import { readableBytes } from 'src/utilities/unitConversions';
import { generateObjectUrl } from '../utilities';

const useStyles = makeStyles((theme: Theme) => ({
  objectNameWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center'
  }
}));

interface Props {
  clusterId: Linode.ClusterID;
  bucketName: string;
  objectName: string;
  objectSize: number;
  objectLastModified: string;
}

const ObjectTableRow: React.FC<Props> = props => {
  const classes = useStyles();

  const {
    clusterId,
    bucketName,
    objectName,
    objectSize,
    objectLastModified
  } = props;

  const objectUrl = generateObjectUrl(clusterId, bucketName, objectName);

  return (
    <TableRow key={objectName}>
      <TableCell parentColumn="Object">
        <Grid container alignItems="center">
          <Grid item>
            <EntityIcon variant="object" />
          </Grid>
          <Grid item>
            <div className={classes.objectNameWrapper}>
              <Typography variant="h3">{objectName}</Typography>
            </div>
            <a href={objectUrl.absolute}>{objectUrl.path}</a>
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
