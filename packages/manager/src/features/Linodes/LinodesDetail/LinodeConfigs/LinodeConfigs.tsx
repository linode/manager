import {
  useAllLinodeConfigsQuery,
  useGrants,
  useLinodeQuery,
} from '@linode/queries';
import { Box, Button, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useParams } from '@tanstack/react-router';
import * as React from 'react';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { NO_PERMISSION_TOOLTIP_TEXT } from 'src/constants';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useCanUpgradeInterfaces } from 'src/hooks/useCanUpgradeInterfaces';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { sendLinodeConfigurationDocsEvent } from 'src/utilities/analytics/customEventAnalytics';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import { useLinodeDetailContext } from '../LinodesDetailContext';
import { BootConfigDialog } from './BootConfigDialog';
import { ConfigRow } from './ConfigRow';
import { DeleteConfigDialog } from './DeleteConfigDialog';
import { LinodeConfigDialog } from './LinodeConfigDialog';
import { getUnableToUpgradeTooltipText } from './UpgradeInterfaces/utils';

export const DEFAULT_UPGRADE_BUTTON_HELPER_TEXT = (
  <>
    <Typography>
      Configuration Profile interfaces from a single profile can be upgraded to
      Linode Interfaces.
    </Typography>
    <Typography mt={2}>
      After the upgrade, the Linode can only use Linode Interfaces and cannot
      revert to Configuration Profile interfaces. Use the dry-run feature to
      review the changes before committing.
    </Typography>
  </>
);

const LinodeConfigs = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isBareMetalInstance } = useLinodeDetailContext();

  const { linodeId } = useParams({ from: '/linodes/$linodeId' });

  const id = Number(linodeId);

  const { data: permissions } = usePermissions(
    'linode',
    ['create_linode_config_profile'],
    id
  );

  const { data: linode } = useLinodeQuery(id);
  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();
  const { canUpgradeInterfaces, unableToUpgradeReasons } =
    useCanUpgradeInterfaces(
      linode?.lke_cluster_id,
      linode?.region,
      linode?.interface_generation
    );

  const unableToUpgradeTooltip = getUnableToUpgradeTooltipText(
    unableToUpgradeReasons
  );
  const upgradeInterfacesTooltipText =
    unableToUpgradeTooltip ?? DEFAULT_UPGRADE_BUTTON_HELPER_TEXT;

  const isLegacyConfigInterface = linode?.interface_generation !== 'linode';

  const configsPanel = React.useRef(undefined);

  const { data: grants } = useGrants();

  const isReadOnly =
    grants !== undefined &&
    grants?.linode.find((grant) => grant.id === id)?.permissions ===
      'read_only';

  const { data: configs, error, isLoading } = useAllLinodeConfigsQuery(id);

  const [isLinodeConfigDialogOpen, setIsLinodeConfigDialogOpen] =
    React.useState(false);
  const [isDeleteConfigDialogOpen, setIsDeleteConfigDialogOpen] =
    React.useState(false);
  const [isBootConfigDialogOpen, setIsBootConfigDialogOpen] =
    React.useState(false);

  const openUpgradeInterfacesDialog = () => {
    navigate({
      to: `/linodes/$linodeId/configurations/upgrade-interfaces`,
      params: {
        linodeId: id,
      },
    });
  };

  const [selectedConfigId, setSelectedConfigId] = React.useState<number>();

  const selectedConfig = configs?.find(
    (config) => config.id === selectedConfigId
  );

  const { sortedData, order, orderBy, handleOrderChange } = useOrderV2({
    data: configs,
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'label',
      },
      from: '/linodes/$linodeId/configurations',
    },
    preferenceKey: 'linode-configs',
  });

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

  if (isBareMetalInstance) {
    return null;
  }

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
          label={'Configuration Profiles'}
          onClick={() => {
            sendLinodeConfigurationDocsEvent('Configuration Profiles');
          }}
        />
        {isLinodeInterfacesEnabled &&
          linode?.interface_generation !== 'linode' && (
            <Button
              alwaysShowTooltip
              buttonType="outlined"
              disabled={isReadOnly || !canUpgradeInterfaces}
              onClick={openUpgradeInterfacesDialog}
              TooltipProps={{
                slotProps: {
                  tooltip: {
                    sx: {
                      maxWidth: !canUpgradeInterfaces ? '210px' : '260px',
                    },
                  },
                },
              }}
              tooltipText={upgradeInterfacesTooltipText}
            >
              Upgrade Interfaces
            </Button>
          )}
        <Button
          buttonType="primary"
          disabled={!permissions.create_linode_config_profile}
          onClick={onCreate}
          tooltipText={
            !permissions.create_linode_config_profile
              ? NO_PERMISSION_TOOLTIP_TEXT
              : undefined
          }
        >
          Add Configuration
        </Button>
      </Box>
      <Paginate data={sortedData ?? []} scrollToRef={configsPanel}>
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
                    error={error ?? undefined}
                    length={paginatedData.length}
                    loading={isLoading}
                    loadingProps={{
                      columns: 4,
                    }}
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
      <LinodeConfigDialog
        config={selectedConfig}
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
