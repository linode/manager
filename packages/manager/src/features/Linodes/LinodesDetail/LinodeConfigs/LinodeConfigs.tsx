import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import AddNewLink from 'src/components/AddNewLink';
import { Box } from 'src/components/Box';
import { DocsLink } from 'src/components/DocsLink/DocsLink';
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
import { sendLinodeConfigurationDocsEvent } from 'src/utilities/analytics';

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
      <Box
        display="flex"
        gap={2}
        justifyContent={'flex-end'}
        sx={{ padding: '7px 0' }}
      >
        <DocsLink
          href={
            'https://www.linode.com/docs/products/compute/compute-instances/guides/configuration-profiles/'
          }
          onClick={() => {
            sendLinodeConfigurationDocsEvent('Configuration Profiles');
          }}
          label={'Configuration Profiles'}
        />
        <AddNewLink
          disabled={isReadOnly}
          label="Add Configuration"
          onClick={onCreate}
        />
      </Box>
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
                          sx={{
                            ...theme.applyTableHeaderStyles,
                            width: '35%',
                          }}
                          active={orderBy === 'label'}
                          direction={order}
                          handleClick={handleOrderChange}
                          label={'label'}
                        >
                          <strong>Config</strong>
                        </TableSortCell>
                        <TableCell
                          sx={{
                            borderRight: `1px solid ${theme.palette.divider}`,
                            fontFamily: theme.font.bold,
                            width: '25%',
                          }}
                        >
                          Disks
                        </TableCell>
                        <TableCell
                          sx={{
                            borderRight: `1px solid ${theme.palette.divider}`,
                            fontFamily: theme.font.bold,
                            width: '30%',
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
