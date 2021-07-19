import { Disk } from '@linode/api-v4/lib/linodes';
import { intersection, pathOr } from 'ramda';
import * as React from 'react';
import CheckBox from 'src/components/CheckBox';
import { makeStyles } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Grid from 'src/components/Grid';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import { DiskSelection } from './utilities';

const useStyles = makeStyles(() => ({
  labelCol: {
    width: '65%',
  },
  sizeCol: {
    width: '35%',
  },
}));

export interface Props {
  disks: Disk[];
  diskSelection: DiskSelection;
  selectedConfigIds: number[];
  handleSelect: (id: number) => void;
}

export const Disks: React.FC<Props> = (props) => {
  const { disks, diskSelection, selectedConfigIds, handleSelect } = props;

  const classes = useStyles();

  return (
    <Paginate data={disks}>
      {({
        data: paginatedData,
        handlePageChange,
        handlePageSizeChange,
        page,
        pageSize,
        count,
      }) => {
        return (
          <React.Fragment>
            <Grid container>
              <Grid item xs={12} md={9}>
                <Table aria-label="List of Disks">
                  <TableHead>
                    <TableRow>
                      <TableCell className={classes.labelCol}>Label</TableCell>
                      <TableCell className={classes.sizeCol}>Size</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedData.length === 0 ? (
                      <TableRowEmptyState colSpan={2} />
                    ) : (
                      paginatedData.map((disk: Disk) => {
                        const isDiskSelected =
                          diskSelection[disk.id] &&
                          diskSelection[disk.id].isSelected;

                        const isConfigSelected =
                          // Is there anything in common between this disk's
                          // associatedConfigIds and the selectedConfigsIds?
                          intersection(
                            pathOr(
                              [],
                              [disk.id, 'associatedConfigIds'],
                              diskSelection
                            ),
                            selectedConfigIds
                          ).length > 0;

                        return (
                          <TableRow key={disk.id} data-qa-disk={disk.label}>
                            <TableCell>
                              <CheckBox
                                text={disk.label}
                                checked={isDiskSelected || isConfigSelected}
                                disabled={isConfigSelected}
                                onChange={() => handleSelect(disk.id)}
                                data-testid={`checkbox-${disk.id}`}
                              />
                            </TableCell>
                            <TableCell>{disk.size} MB</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </Grid>
            </Grid>
            <PaginationFooter
              count={count}
              page={page}
              pageSize={pageSize}
              handlePageChange={handlePageChange}
              handleSizeChange={handlePageSizeChange}
              eventCategory="linode disks"
            />
          </React.Fragment>
        );
      }}
    </Paginate>
  );
};

export default Disks;
