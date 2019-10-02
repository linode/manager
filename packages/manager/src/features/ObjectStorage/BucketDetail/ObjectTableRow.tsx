import * as React from 'react';
import Box from 'src/components/core/Box';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { readableBytes } from 'src/utilities/unitConversions';
import ObjectActionMenu from './ObjectActionMenu';

interface Props {
  objectName: string;
  objectSize: number;
  objectLastModified: string;
  handleClickDelete: () => void;
}

const ObjectTableRow: React.FC<Props> = props => {
  const {
    objectName,
    objectSize,
    objectLastModified,
    handleClickDelete
  } = props;

  return (
    <TableRow>
      <TableCell parentColumn="Object">
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className="py0">
            <EntityIcon variant="object" size={20} />
          </Grid>
          <Grid item>
            <Box display="flex" alignItems="center">
              <Typography>
                <strong>{objectName}</strong>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell parentColumn="Size" noWrap>
        {readableBytes(objectSize).formatted}
      </TableCell>
      <TableCell parentColumn="Last Modified" noWrap>
        <DateTimeDisplay value={objectLastModified} humanizeCutoff="never" />
      </TableCell>
      <TableCell>
        <ObjectActionMenu handleClickDelete={handleClickDelete} />
      </TableCell>
    </TableRow>
  );
};

export default React.memo(ObjectTableRow);
