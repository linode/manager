import { Disk } from '@linode/api-v4/lib/linodes';
import Grid from '@mui/material/Unstable_Grid2';
import { intersection, pathOr } from 'ramda';
import * as React from 'react';

import { Checkbox } from 'src/components/Checkbox';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';

import { DiskSelection } from './utilities';

export interface DisksProps {
  diskSelection: DiskSelection;
  disks: Disk[];
  handleSelect: (id: number) => void;
  selectedConfigIds: number[];
}

export const Disks = (props: DisksProps) => {
  const { diskSelection, disks, handleSelect, selectedConfigIds } = props;

  return (
    <Paginate data={disks}>
      {({
        count,
        data: paginatedData,
        handlePageChange,
        handlePageSizeChange,
        page,
        pageSize,
      }) => {
        return (
          <React.Fragment>
            <Grid container>
              <Grid md={9} xs={12}>
                <Table aria-label="List of Disks">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: '65%' }}>Label</TableCell>
                      <TableCell sx={{ width: '35%' }}>Size</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedData.length === 0 ? (
                      <TableRowEmpty colSpan={2} />
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
                          <TableRow data-qa-disk={disk.label} key={disk.id}>
                            <TableCell>
                              <Checkbox
                                checked={isDiskSelected || isConfigSelected}
                                data-testid={`checkbox-${disk.id}`}
                                disabled={isConfigSelected}
                                onChange={() => handleSelect(disk.id)}
                                text={disk.label}
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
              eventCategory="linode disks"
              handlePageChange={handlePageChange}
              handleSizeChange={handlePageSizeChange}
              page={page}
              pageSize={pageSize}
            />
          </React.Fragment>
        );
      }}
    </Paginate>
  );
};

export default Disks;
