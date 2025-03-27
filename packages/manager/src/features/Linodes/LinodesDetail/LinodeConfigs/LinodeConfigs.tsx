import {
  useAccountSettings,
  useAllLinodeConfigsQuery,
  useGrants,
  useLinodeQuery,
  useRegionsQuery,
} from '@linode/queries';
import { Box, Button } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';

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
import { sendLinodeConfigurationDocsEvent } from 'src/utilities/analytics/customEventAnalytics';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import { BootConfigDialog } from './BootConfigDialog';
import { ConfigRow } from './ConfigRow';
import { DeleteConfigDialog } from './DeleteConfigDialog';
import { LinodeConfigDialog } from './LinodeConfigDialog';

const LinodeConfigs = () => {
  const theme = useTheme();
  const location = useLocation();
  const history = useHistory();

  const { linodeId } = useParams<{ linodeId: string }>();

  const id = Number(linodeId);

  const { data: linode } = useLinodeQuery(id);
  const { data: regions } = useRegionsQuery();
  const { data: accountSettings } = useAccountSettings();

  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();

  const isLegacyConfigInterface = linode?.interface_generation !== 'linode';

  const configsPanel = React.useRef();

  const { data: grants } = useGrants();

  const isReadOnly =
    grants !== undefined &&
    grants?.linode.find((grant) => grant.id === id)?.permissions ===
      'read_only';

  const regionSupportsLinodeInterfaces =
    regions
      ?.find((r) => r.id === linode?.region)
      ?.capabilities.includes('Linode Interfaces') ?? false;
  const showUpgradeInterfacesButton =
    // show the Upgrade Interfaces button if our Linode is not part of an LKE cluster, is
    // using Legacy config profile interfaces in a region that supports the new Interfaces
    // and our account can have Linodes using new interfaces
    isLinodeInterfacesEnabled &&
    linode?.interface_generation !== 'linode' &&
    !linode?.lke_cluster_id &&
    accountSettings?.interfaces_for_new_linodes !== 'legacy_config_only' &&
    regionSupportsLinodeInterfaces;

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

  const openUpgradeInterfacesDialog = () => {
    history.replace(`${location.pathname}/upgrade-interfaces`);
  };

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
            'https://techdocs.akamai.com/cloud-computing/docs/manage-configuration-profiles-on-a-compute-instance'
          }
          onClick={() => {
            sendLinodeConfigurationDocsEvent('Configuration Profiles');
          }}
          label={'Configuration Profiles'}
        />
        {showUpgradeInterfacesButton && (
          <Button
            alwaysShowTooltip
            buttonType="outlined"
            disabled={isReadOnly}
            onClick={openUpgradeInterfacesDialog}
            tooltipText="Upgrade to Linode interfaces to connect the interface to the Linode not the Configuration Profile. You can perform a dry run to identify any issues before upgrading."
          >
            Upgrade Interfaces
          </Button>
        )}
        <Button buttonType="primary" disabled={isReadOnly} onClick={onCreate}>
          Add Configuration
        </Button>
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
                          <strong>Configuration</strong>
                        </TableSortCell>
                        <TableCell
                          sx={{
                            font: theme.font.bold,
                            width: isLegacyConfigInterface ? '25%' : '55%',
                          }}
                        >
                          Disks
                        </TableCell>
                        {isLegacyConfigInterface && (
                          <TableCell
                            sx={{
                              font: theme.font.bold,
                              width: '30%',
                            }}
                          >
                            Network Interfaces
                          </TableCell>
                        )}
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
