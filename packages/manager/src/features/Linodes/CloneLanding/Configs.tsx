import { Checkbox } from '@linode/ui';
import * as React from 'react';

import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';

import type { ConfigSelection } from './utilities';
import type { Config } from '@linode/api-v4/lib/linodes';

export interface ConfigsProps {
  configs: Config[];
  configSelection: ConfigSelection;
  handleSelect: (id: number) => void;
}

export const Configs = (props: ConfigsProps) => {
  const { configSelection, configs, handleSelect } = props;

  return (
    <Paginate data={configs}>
      {({
        count,
        data: paginatedData,
        handlePageChange,
        handlePageSizeChange,
        page,
        pageSize,
      }) => {
        return (
          <div>
            <Table
              aria-label="List of Configurations"
              sx={{
                '& td': {
                  borderBottom: 'none',
                  paddingBottom: 0,
                  paddingTop: 0,
                },
              }}
            >
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRowEmpty colSpan={1} />
                ) : (
                  paginatedData.map((config: Config) => (
                    <TableRow data-qa-config={config.label} key={config.id}>
                      <TableCell>
                        <Checkbox
                          checked={
                            configSelection[config.id] &&
                            configSelection[config.id].isSelected
                          }
                          data-testid={`checkbox-${config.id}`}
                          onChange={() => handleSelect(config.id)}
                          text={config.label}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <PaginationFooter
              count={count}
              eventCategory="linode configs"
              handlePageChange={handlePageChange}
              handleSizeChange={handlePageSizeChange}
              page={page}
              pageSize={pageSize}
            />
          </div>
        );
      }}
    </Paginate>
  );
};

export default Configs;
