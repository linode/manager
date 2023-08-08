import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import AddNewLink from 'src/components/AddNewLink';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { useAllLinodeConfigsQuery } from 'src/queries/linodes/configs';
import { useGrants } from 'src/queries/profile';

import { BootConfigDialog } from './BootConfigDialog';
import { ConfigRow } from './ConfigRow';
import { DeleteConfigDialog } from './DeleteConfigDialog';
import { LinodeConfigDialog } from './LinodeConfigDialog';

const LinodeConfigs = () => {
  const theme = useTheme();

  const { linodeId } = useParams<{ linodeId: string }>();

  const id = Number(linodeId);

  const configsPanel = React.useRef();

  const { data: grants } = useGrants();

  const isReadOnly =
    grants !== undefined &&
    grants?.linode.find((grant) => grant.id === id)?.permissions ===
      'read_only';

  const { data: configs, error, isLoading } = useAllLinodeConfigsQuery(id);

  const [
    isLinodeConfigDialogOpen,
    setIsLinodeConfigDialogOpen,
  ] = React.useState(false);
  const [
    isDeleteConfigDialogOpen,
    setIsDeleteConfigDialogOpen,
  ] = React.useState(false);
  const [isBootConfigDialogOpen, setIsBootConfigDialogOpen] = React.useState(
    false
  );

  const [selectedConfigId, setSelectedConfigId] = React.useState<number>();

  const selectedConfig = configs?.find(
    (config) => config.id === selectedConfigId
  );

  const onBoot = (configId: number) => {
    setSelectedConfigId(configId);
    setIsBootConfigDialogOpen(true);
  };

  const onDelete = (configId: number) => {
    setSelectedConfigId(configId);
    setIsDeleteConfigDialogOpen(true);
  };

  const onEdit = (configId: number) => {
    setSelectedConfigId(configId);
    setIsLinodeConfigDialogOpen(true);
  };

  const onCreate = () => {
    setSelectedConfigId(undefined);
    setIsLinodeConfigDialogOpen(true);
  };

  return (
    <>
      <Grid
        sx={{
          padding: '0 0 8px 0',
        }}
        alignItems="flex-end"
        container
        justifyContent="flex-end"
      >
        <Grid>
          <AddNewLink
            disabled={isReadOnly}
            label="Add Configuration"
            onClick={onCreate}
          />
        </Grid>
      </Grid>
      <OrderBy data={configs ?? []} order={'asc'} orderBy={'label'}>
        {({ data: orderedData, handleOrderChange, order, orderBy }) => (
          <Paginate data={orderedData} scrollToRef={configsPanel}>
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
                  <Table aria-label="List of Configurations">
                    <TableHead>
                      <TableRow>
                        <TableSortCell
                          active={orderBy === 'label'}
                          direction={order}
                          handleClick={handleOrderChange}
                          label={'label'}
                          sx={{
                            ...theme.applyTableHeaderStyles,
                            width: '35%',
                          }}
                        >
                          <strong>Config</strong>
                        </TableSortCell>
                        <TableCell
                          sx={{
                            width: '25%',
                            borderRight: `1px solid ${theme.palette.divider}`,
                            fontWeight: 'bold',
                          }}
                        >
                          Disks
                        </TableCell>
                        <TableCell
                          sx={{
                            width: '30%',
                            borderRight: `1px solid ${theme.palette.divider}`,
                            fontWeight: 'bold',
                          }}
                        >
                          Network Interfaces
                        </TableCell>
                        <TableCell sx={{ width: '10%' }} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableContentWrapper
                        loadingProps={{
                          columns: 4,
                        }}
                        error={error ?? undefined}
                        length={paginatedData.length}
                        loading={isLoading}
                      >
                        {paginatedData.map((thisConfig) => {
                          return (
                            <ConfigRow
                              config={thisConfig}
                              key={`config-row-${thisConfig.id}`}
                              linodeId={id}
                              onBoot={() => onBoot(thisConfig.id)}
                              onDelete={() => onDelete(thisConfig.id)}
                              onEdit={() => onEdit(thisConfig.id)}
                              readOnly={isReadOnly}
                            />
                          );
                        })}
                      </TableContentWrapper>
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
                </React.Fragment>
              );
            }}
          </Paginate>
        )}
      </OrderBy>
      <LinodeConfigDialog
        config={selectedConfig}
        isReadOnly={isReadOnly}
        linodeId={id}
        onClose={() => setIsLinodeConfigDialogOpen(false)}
        open={isLinodeConfigDialogOpen}
      />
      <BootConfigDialog
        config={selectedConfig}
        linodeId={id}
        onClose={() => setIsBootConfigDialogOpen(false)}
        open={isBootConfigDialogOpen}
      />
      <DeleteConfigDialog
        config={selectedConfig}
        linodeId={id}
        onClose={() => setIsDeleteConfigDialogOpen(false)}
        open={isDeleteConfigDialogOpen}
      />
    </>
  );
};

export default LinodeConfigs;
