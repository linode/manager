import * as React from 'react';
import AddNewLink from 'src/components/AddNewLink';
import { Theme } from '@mui/material/styles';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import Grid from '@mui/material/Unstable_Grid2';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import TableContentWrapper from 'src/components/TableContentWrapper';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { LinodeConfigDialog } from '../LinodeSettings/LinodeConfigDialog';
import { ConfigRow } from './ConfigRow';
import { useParams } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { useAllLinodeConfigsQuery } from 'src/queries/linodes/linodes';
import { useGrants } from 'src/queries/profile';
import { BootConfigDialog } from './BootConfigDialog';
import { DeleteConfigDialog } from './DeleteConfigDialog';

const useStyles = makeStyles((theme: Theme) => ({
  tableCell: {
    borderRight: `1px solid ${theme.palette.divider}`,
    fontWeight: 'bold',
  },
  labelColumn: {
    ...theme.applyTableHeaderStyles,
    width: '35%',
  },
  interfacesColumn: {
    width: '30%',
  },
  deviceColumn: {
    width: '25%',
  },
  actionsColumn: {
    width: '10%',
  },
}));

const LinodeConfigs = () => {
  const classes = useStyles();

  const { linodeId } = useParams<{ linodeId: string }>();

  const id = Number(linodeId);

  const configsPanel = React.useRef();

  const { data: grants } = useGrants();

  const isReadOnly =
    grants !== undefined &&
    grants?.linode.find((grant) => grant.id === id)?.permissions ===
      'read_only';

  const { data: configs, isLoading, error } = useAllLinodeConfigsQuery(id);

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
        container
        alignItems="flex-end"
        justifyContent="flex-end"
        sx={{
          padding: '0 0 8px 0',
        }}
      >
        <Grid>
          <AddNewLink
            onClick={onCreate}
            label="Add Configuration"
            disabled={isReadOnly}
          />
        </Grid>
      </Grid>
      <OrderBy data={configs ?? []} orderBy={'label'} order={'asc'}>
        {({ data: orderedData, handleOrderChange, order, orderBy }) => (
          <Paginate data={orderedData} scrollToRef={configsPanel}>
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
                  <Table aria-label="List of Configurations">
                    <TableHead>
                      <TableRow>
                        <TableSortCell
                          active={orderBy === 'label'}
                          label={'label'}
                          direction={order}
                          handleClick={handleOrderChange}
                          data-qa-config-label-header
                          className={classes.labelColumn}
                        >
                          <strong>Config</strong>
                        </TableSortCell>
                        <TableCell
                          className={`${classes.tableCell} ${classes.deviceColumn}`}
                        >
                          Disks
                        </TableCell>
                        <TableCell
                          className={`${classes.tableCell} ${classes.interfacesColumn}`}
                        >
                          Network Interfaces
                        </TableCell>
                        <TableCell className={classes.actionsColumn} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableContentWrapper
                        loadingProps={{
                          columns: 4,
                        }}
                        loading={isLoading}
                        length={paginatedData.length}
                        error={error ?? undefined}
                      >
                        {paginatedData.map((thisConfig) => {
                          return (
                            <ConfigRow
                              key={`config-row-${thisConfig.id}`}
                              config={thisConfig}
                              linodeId={id}
                              onBoot={() => onBoot(thisConfig.id)}
                              onEdit={() => onEdit(thisConfig.id)}
                              onDelete={() => onDelete(thisConfig.id)}
                              readOnly={isReadOnly}
                            />
                          );
                        })}
                      </TableContentWrapper>
                    </TableBody>
                  </Table>
                  <PaginationFooter
                    count={count}
                    page={page}
                    pageSize={pageSize}
                    handlePageChange={handlePageChange}
                    handleSizeChange={handlePageSizeChange}
                    eventCategory="linode configs"
                  />
                </React.Fragment>
              );
            }}
          </Paginate>
        )}
      </OrderBy>
      <LinodeConfigDialog
        linodeId={id}
        config={selectedConfig}
        isReadOnly={isReadOnly}
        onClose={() => setIsLinodeConfigDialogOpen(false)}
        open={isLinodeConfigDialogOpen}
      />
      <BootConfigDialog
        open={isBootConfigDialogOpen}
        onClose={() => setIsBootConfigDialogOpen(false)}
        linodeId={id}
        config={selectedConfig}
      />
      <DeleteConfigDialog
        open={isDeleteConfigDialogOpen}
        onClose={() => setIsDeleteConfigDialogOpen(false)}
        linodeId={id}
        config={selectedConfig}
      />
    </>
  );
};

export default LinodeConfigs;
