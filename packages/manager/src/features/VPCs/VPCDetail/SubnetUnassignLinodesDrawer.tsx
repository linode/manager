import {
  linodeQueries,
  useAllLinodesQuery,
  useGrants,
  useProfile,
} from '@linode/queries';
import {
  ActionsPanel,
  Autocomplete,
  Box,
  Drawer,
  Notice,
  Stack,
  Typography,
} from '@linode/ui';
import { useFormattedDate } from '@linode/utilities';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as React from 'react';

import { DownloadCSV } from 'src/components/DownloadCSV/DownloadCSV';
import { NotFound } from 'src/components/NotFound';
import { RemovableSelectionsListTable } from 'src/components/RemovableSelectionsList/RemovableSelectionsListTable';
import { SUBNET_UNASSIGN_LINODES_WARNING } from 'src/features/VPCs/constants';
import { useUnassignLinode } from 'src/hooks/useUnassignLinode';
import { SUBNET_LINODE_CSV_HEADERS } from 'src/utilities/subnets';

import {
  getLinodeInterfacePrimaryIPv4,
  getLinodeInterfaceRanges,
} from '../utils';

import type {
  APIError,
  DeleteLinodeConfigInterfacePayload,
  Linode,
  Subnet,
  UpdateConfigInterfacePayload,
} from '@linode/api-v4';

interface Props {
  isFetching: boolean;
  onClose: () => void;
  open: boolean;
  singleLinodeToBeUnassigned?: Linode;
  subnet?: Subnet;
  vpcId: number;
}

export interface InterfaceAndLinodeData extends Linode {
  configId: null | number;
  interfaceId: number;
  vpcIPv4: null | string | undefined;
  vpcRanges: string[] | undefined;
}

export const SubnetUnassignLinodesDrawer = React.memo(
  ({
    isFetching,
    onClose,
    open,
    singleLinodeToBeUnassigned,
    subnet,
    vpcId,
  }: Props) => {
    const { data: profile } = useProfile();
    const { data: grants } = useGrants();
    const vpcPermissions = grants?.vpc.find((v) => v.id === vpcId);

    const queryClient = useQueryClient();
    const { setUnassignLinodesErrors, unassignLinode, unassignLinodesErrors } =
      useUnassignLinode();

    const csvRef = React.useRef<any>();
    const formattedDate = useFormattedDate();

    const [selectedLinodes, setSelectedLinodes] = React.useState<Linode[]>(
      singleLinodeToBeUnassigned ? [singleLinodeToBeUnassigned] : []
    );
    const [selectedLinodesAndConfigData, setSelectedLinodesAndConfigData] =
      React.useState<InterfaceAndLinodeData[]>([]);

    const hasError = React.useRef(false); // This flag is used to prevent the drawer from closing if an error occurs.

    const [linodeOptionsToUnassign, setLinodeOptionsToUnassign] =
      React.useState<Linode[]>([]);
    const [configInterfacesToDelete, setConfigInterfacesToDelete] =
      React.useState<DeleteLinodeConfigInterfacePayload[]>([]);

    const { linodes: subnetLinodeIds } = subnet || {};

    const userCannotUnassignLinodes =
      Boolean(profile?.restricted) &&
      (vpcPermissions?.permissions === 'read_only' || grants?.vpc.length === 0);

    // 1. We need to get all the linodes.
    const {
      data: linodes,
      error: linodesError,
      refetch: getCSVData,
    } = useAllLinodesQuery();

    // 2. We need to filter only the linodes that are assigned to the subnet.
    const findAssignedLinodes = React.useCallback(() => {
      return linodes?.filter((linode) => {
        return subnetLinodeIds?.some(
          (linodeInfo) => linodeInfo.id === linode.id
        );
      });
    }, [linodes, subnetLinodeIds]);

    React.useEffect(() => {
      if (linodes) {
        setLinodeOptionsToUnassign(findAssignedLinodes() ?? []);
      }
    }, [linodes, setLinodeOptionsToUnassign, findAssignedLinodes]);

    // 3. When a linode is selected, we need to get the VPC interface to unassign.
    const getVPCInterface = React.useCallback(
      async (selectedLinodes: Linode[]) => {
        try {
          const updatedConfigInterfaces: (InterfaceAndLinodeData | null)[] =
            await Promise.all(
              selectedLinodes.map(async (linode) => {
                // Get the SubnetLinodeInterfaceData associated with this Linode (the config and interface ID)
                const subnetInterfaces = subnet?.linodes.find(
                  (subnetLinodeData) => subnetLinodeData.id === linode.id
                )?.interfaces;
                const subnetInterfaceData =
                  subnetInterfaces?.find(
                    (interfaceData) => interfaceData.active
                  ) ?? subnetInterfaces?.[0];
                const { config_id: configId, id: interfaceId } =
                  subnetInterfaceData ?? {};

                let vpcInterface;

                if (
                  linode.interface_generation === 'legacy_config' &&
                  configId &&
                  interfaceId
                ) {
                  vpcInterface = await queryClient.fetchQuery(
                    linodeQueries
                      .linode(linode.id)
                      ._ctx.configs._ctx.config(configId)
                      ._ctx.interface(interfaceId)
                  );
                } else {
                  vpcInterface = await queryClient.fetchQuery(
                    linodeQueries
                      .linode(linode.id)
                      ._ctx.interfaces._ctx.interface(interfaceId ?? -1)
                  );
                }

                if (vpcInterface) {
                  if ('vpc' in vpcInterface) {
                    return {
                      ...linode,
                      configId: null,
                      vpcIPv4: getLinodeInterfacePrimaryIPv4(vpcInterface),
                      vpcRanges: getLinodeInterfaceRanges(vpcInterface),
                      interfaceId: vpcInterface.id,
                    };
                  }

                  return {
                    ...linode,
                    configId: configId ?? -1,
                    interfaceId: vpcInterface.id,
                    vpcIPv4: vpcInterface.ipv4?.vpc,
                    vpcRanges: vpcInterface?.ip_ranges,
                  };
                }
                return null;
              })
            );

          // Filter out any null values and ensure item conforms to type using `is` type guard.
          const _selectedLinodesAndConfigData = updatedConfigInterfaces.filter(
            (item): item is InterfaceAndLinodeData => item !== null
          );

          // Remove interface property for the DeleteLinodeConfigInterfacePayload data
          const _updatedConfigInterfaces = updatedConfigInterfaces.map(
            (item) => ({
              configId: item?.configId,
              interfaceId: item?.interfaceId,
              linodeId: item?.id,
            })
          );

          const filteredConfigInterfaces = _updatedConfigInterfaces.filter(
            (item): item is DeleteLinodeConfigInterfacePayload => item !== null
          );

          // Update the state with the new data
          setConfigInterfacesToDelete([...filteredConfigInterfaces]);
          setSelectedLinodesAndConfigData([..._selectedLinodesAndConfigData]);
        } catch (error) {
          // Capture errors if the promise.all fails
          hasError.current = true;
          setUnassignLinodesErrors(error as APIError[]);
        }
      },
      [queryClient, setUnassignLinodesErrors, subnet?.linodes]
    );

    React.useEffect(() => {
      if (singleLinodeToBeUnassigned) {
        getVPCInterface([singleLinodeToBeUnassigned]);
      }
    }, [singleLinodeToBeUnassigned, getVPCInterface]);

    const downloadCSV = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      await getCSVData();
      csvRef.current.link.click();
    };

    const handleRemoveLinode = (optionToRemove: InterfaceAndLinodeData) => {
      setSelectedLinodes((prevSelectedLinodes) =>
        prevSelectedLinodes.filter((option) => option.id !== optionToRemove.id)
      );

      setConfigInterfacesToDelete((prevInterfacesToDelete) =>
        prevInterfacesToDelete.filter(
          (option) => option.linodeId !== optionToRemove.id
        )
      );

      setSelectedLinodesAndConfigData((prevSelectedLinodesAndConfigData) =>
        prevSelectedLinodesAndConfigData.filter(
          (option) => option.id !== optionToRemove.id
        )
      );
    };

    const processUnassignLinodes = async () => {
      try {
        const promises = configInterfacesToDelete.map(async (_interface) => {
          try {
            await unassignLinode({
              configId: _interface.configId,
              interfaceId: _interface.interfaceId,
              linodeId: _interface.linodeId,
              vpcId,
            });
          } catch (error) {
            hasError.current = true;
            setUnassignLinodesErrors((prevErrors: APIError[]) => [
              ...prevErrors,
              ...error,
            ]);
          }
        });

        // Use Promise.all to concurrently process each item in
        // the configInterfacesToDelete array
        await Promise.all(promises);
      } catch (error) {
        // Handle any unexpected errors here
        setUnassignLinodesErrors([error]);
      }
    };

    // 4. When the user submits the form, we need to process the unassign linodes.
    const handleUnassignLinode = async () => {
      await processUnassignLinodes();

      // Close the drawer if there are no errors.
      if (!hasError.current) {
        handleOnClose();
      }
    };

    const { handleSubmit, resetForm } = useFormik<UpdateConfigInterfacePayload>(
      {
        enableReinitialize: true,
        initialValues: {},
        onSubmit: handleUnassignLinode,
        validateOnBlur: false,
        validateOnChange: false,
      }
    );

    const handleOnClose = () => {
      resetForm();
      setSelectedLinodes([]);
      setSelectedLinodesAndConfigData([]);
      setConfigInterfacesToDelete([]);
      setUnassignLinodesErrors([]);
      onClose();
    };

    return (
      <Drawer
        isFetching={isFetching}
        NotFoundComponent={NotFound}
        onClose={handleOnClose}
        open={open}
        title={`Unassign Linodes from subnet: ${subnet?.label} (${
          subnet?.ipv4 ?? subnet?.ipv6
        })`}
      >
        {userCannotUnassignLinodes && (
          <Notice
            important
            text={`You don't have permissions to unassign Linodes from ${subnet?.label}. Please contact an account administrator for details.`}
            variant="error"
          />
        )}
        {unassignLinodesErrors.length > 0 && (
          <Notice text={unassignLinodesErrors[0].reason} variant="error" />
        )}
        <Notice
          spacingBottom={singleLinodeToBeUnassigned ? 0 : 16}
          text={SUBNET_UNASSIGN_LINODES_WARNING}
          variant="warning"
        />
        {!singleLinodeToBeUnassigned && (
          <Typography>
            Select the Linodes you would like to unassign from this subnet. Only
            Linodes in this VPC&rsquo;s region are displayed.
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <Stack>
            {!singleLinodeToBeUnassigned && (
              <Autocomplete
                disabled={userCannotUnassignLinodes}
                errorText={linodesError ? linodesError[0].reason : undefined}
                label="Linodes"
                multiple
                onChange={(_, value) => {
                  setSelectedLinodes(value);
                  getVPCInterface(value);
                }}
                options={linodeOptionsToUnassign}
                placeholder="Select Linodes or type to search"
                renderTags={() => null}
                value={selectedLinodes}
              />
            )}
            <Box sx={(theme) => ({ marginTop: theme.spacingFunction(16) })}>
              <RemovableSelectionsListTable
                headerText={`Linodes to be Unassigned from Subnet (${selectedLinodes.length})`}
                isRemovable={!singleLinodeToBeUnassigned}
                noDataText="Select Linodes to be Unassigned from Subnet."
                onRemove={handleRemoveLinode}
                selectionData={selectedLinodesAndConfigData}
                tableHeaders={['Linode', 'VPC IPv4', 'VPC IPv4 Ranges']}
              />
            </Box>
            {selectedLinodesAndConfigData.length > 0 && (
              <DownloadCSV
                buttonType="styledLink"
                csvRef={csvRef}
                data={selectedLinodesAndConfigData}
                filename={`linodes-unassigned-${formattedDate}.csv`}
                headers={SUBNET_LINODE_CSV_HEADERS}
                onClick={downloadCSV}
                sx={{
                  alignItems: 'flex-start',
                  display: 'flex',
                  gap: 1,
                  marginTop: 2,
                  textAlign: 'left',
                }}
                text={'Download List of Linodes to be Unassigned (.csv)'}
              />
            )}
            <ActionsPanel
              primaryButtonProps={{
                'data-testid': 'unassign-submit-button',
                disabled: configInterfacesToDelete.length === 0,
                label: 'Unassign Linodes',
                type: 'submit',
              }}
              secondaryButtonProps={{
                label: 'Cancel',
                onClick: handleOnClose,
              }}
            />
          </Stack>
        </form>
      </Drawer>
    );
  }
);
